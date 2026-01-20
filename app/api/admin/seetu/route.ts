import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Seetu from '@/database/seetu.model';

export async function POST(request: NextRequest) {
  try {
    // Ensure admin
    const admin = await requireAdmin(request);

    const body = await request.json();
    const {
      title,
      openingDate,
      closingDate,
      minAmount,
      maxAmount,
    } = body;

    // Basic validation
    if (!title || !openingDate || !closingDate) {
      return NextResponse.json(
        {
          success: false,
          message: 'Title, opening date, and closing date are required',
        },
        { status: 400 }
      );
    }

    // Validate dates
    const opening = new Date(openingDate);
    const closing = new Date(closingDate);

    if (isNaN(opening.getTime()) || isNaN(closing.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (closing <= opening) {
      return NextResponse.json(
        { success: false, message: 'Closing date must be after opening date' },
        { status: 400 }
      );
    }

    // Validate amounts if provided
    if (minAmount !== undefined && minAmount < 0) {
      return NextResponse.json(
        { success: false, message: 'Minimum amount cannot be negative' },
        { status: 400 }
      );
    }

    if (maxAmount !== undefined && maxAmount < 0) {
      return NextResponse.json(
        { success: false, message: 'Maximum amount cannot be negative' },
        { status: 400 }
      );
    }

    if (minAmount !== undefined && maxAmount !== undefined && minAmount > maxAmount) {
      return NextResponse.json(
        { success: false, message: 'Minimum amount cannot be greater than maximum amount' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const seetu = await Seetu.create({
      title: title.trim(),
      openingDate: opening,
      closingDate: closing,
      minAmount: minAmount !== undefined ? Number(minAmount) : undefined,
      maxAmount: maxAmount !== undefined ? Number(maxAmount) : undefined,
      createdBy: admin.id,
      archived: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Seetu created successfully',
        seetu: {
          id: seetu._id.toString(),
          title: seetu.title,
          openingDate: seetu.openingDate,
          closingDate: seetu.closingDate,
          minAmount: seetu.minAmount,
          maxAmount: seetu.maxAmount,
          createdBy: seetu.createdBy.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create Seetu error:', error);

    // Auth errors
    if (error.message === 'Authentication required' || error.message === 'Admin privileges required') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      );
    }

    // Validation errors from Mongoose
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