import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Seetu from '@/database/seetu.model';

// PATCH - Update a seetu (admin only) - Block updates after opening date
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure admin
    await requireAdmin(request);

    const { id } = await params;

    // Validate ObjectId format
    if (!id || id.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Seetu ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find existing seetu
    const existingSeetu = await Seetu.findById(id);

    if (!existingSeetu) {
      return NextResponse.json(
        { success: false, message: 'Seetu not found' },
        { status: 404 }
      );
    }

    if (existingSeetu.archived) {
      return NextResponse.json(
        { success: false, message: 'Cannot update archived seetu' },
        { status: 400 }
      );
    }

    // Check if seetu has already opened
    const now = new Date();
    if (now >= existingSeetu.openingDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot update seetu after opening date',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, openingDate, closingDate, minAmount, maxAmount } = body;

    // Build update object
    const updateData: any = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length < 3) {
        return NextResponse.json(
          { success: false, message: 'Title must be at least 3 characters' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (openingDate !== undefined) {
      const opening = new Date(openingDate);
      if (isNaN(opening.getTime())) {
        return NextResponse.json(
          { success: false, message: 'Invalid opening date format' },
          { status: 400 }
        );
      }
      updateData.openingDate = opening;
    }

    if (closingDate !== undefined) {
      const closing = new Date(closingDate);
      if (isNaN(closing.getTime())) {
        return NextResponse.json(
          { success: false, message: 'Invalid closing date format' },
          { status: 400 }
        );
      }
      updateData.closingDate = closing;
    }

    // Validate date relationship
    const finalOpeningDate = updateData.openingDate || existingSeetu.openingDate;
    const finalClosingDate = updateData.closingDate || existingSeetu.closingDate;

    if (finalClosingDate <= finalOpeningDate) {
      return NextResponse.json(
        { success: false, message: 'Closing date must be after opening date' },
        { status: 400 }
      );
    }

    if (minAmount !== undefined) {
      if (minAmount < 0) {
        return NextResponse.json(
          { success: false, message: 'Minimum amount cannot be negative' },
          { status: 400 }
        );
      }
      updateData.minAmount = Number(minAmount);
    }

    if (maxAmount !== undefined) {
      if (maxAmount < 0) {
        return NextResponse.json(
          { success: false, message: 'Maximum amount cannot be negative' },
          { status: 400 }
        );
      }
      updateData.maxAmount = Number(maxAmount);
    }

    // Validate amount relationship
    const finalMinAmount = updateData.minAmount !== undefined ? updateData.minAmount : existingSeetu.minAmount;
    const finalMaxAmount = updateData.maxAmount !== undefined ? updateData.maxAmount : existingSeetu.maxAmount;

    if (
      finalMinAmount !== undefined &&
      finalMaxAmount !== undefined &&
      finalMinAmount > finalMaxAmount
    ) {
      return NextResponse.json(
        { success: false, message: 'Minimum amount cannot be greater than maximum amount' },
        { status: 400 }
      );
    }

    // Update seetu
    const updatedSeetu = await Seetu.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Seetu updated successfully',
        seetu: {
          id: updatedSeetu!._id.toString(),
          title: updatedSeetu!.title,
          openingDate: updatedSeetu!.openingDate,
          closingDate: updatedSeetu!.closingDate,
          minAmount: updatedSeetu!.minAmount,
          maxAmount: updatedSeetu!.maxAmount,
          createdBy: updatedSeetu!.createdBy.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update seetu error:', error);

    // Auth errors
    if (
      error.message === 'Authentication required' ||
      error.message === 'Admin privileges required'
    ) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors || {})
        .map((e: any) => e.message)
        .join(', ');

      return NextResponse.json(
        { success: false, message: messages || error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

//DELETE - (admin only) : Soft delete by setting archived flag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure admin
    await requireAdmin(request);

    const { id } = await params;

    // Validate ObjectId format
    if (!id || id.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Seetu ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find existing seetu
    const existingSeetu = await Seetu.findById(id);

    if (!existingSeetu) {
      return NextResponse.json(
        { success: false, message: 'Seetu not found' },
        { status: 404 }
      );
    }

    if (existingSeetu.archived) {
      return NextResponse.json(
        { success: false, message: 'Seetu is already archived' },
        { status: 400 }
      );
    }

    // Soft delete by setting archived flag
    await Seetu.findByIdAndUpdate(id, { $set: { archived: true } });

    return NextResponse.json(
      {
        success: true,
        message: 'Seetu archived successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Archive seetu error:', error);

    // Auth errors
    if (
      error.message === 'Authentication required' ||
      error.message === 'Admin privileges required'
    ) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}