// app/api/seetu/[id]/placements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Placement from '@/database/placement.model';
import Seetu from '@/database/seetu.model';
import { getAuthUser } from '@/lib/auth';

// POST - Create placement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: seetuId } = await params;

    // Validate ObjectId format
    if (!seetuId || seetuId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(seetuId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid seetu ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Check if seetu exists and is not archived
    const seetu = await Seetu.findById(seetuId);
    if (!seetu || seetu.archived) {
      return NextResponse.json(
        { success: false, message: 'Seetu not found' },
        { status: 404 }
      );
    }

    // Create placement (validations handled by pre-save hook)
    const placement = await Placement.create({
      seetuId: seetuId,
      userId: user.id,
      amount,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Placement created successfully',
        placement: {
          id: placement._id.toString(),
          seetuId: placement.seetuId.toString(),
          userId: placement.userId.toString(),
          amount: placement.amount,
          createdAt: placement.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create placement error:', error);

    // Duplicate placement (unique index)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: 'You have already placed an amount for this seetu',
        },
        { status: 409 }
      );
    }

    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create placement' },
      { status: 500 }
    );
  }
}

// GET - List placements (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id: seetuId } = await params;

    // Validate ObjectId format
    if (!seetuId || seetuId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(seetuId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid seetu ID' },
        { status: 400 }
      );
    }

    // Check if seetu exists
    const seetu = await Seetu.findById(seetuId).select('closingDate archived');
    if (!seetu || seetu.archived) {
      return NextResponse.json(
        { success: false, message: 'Seetu not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const isClosed = now >= seetu.closingDate;

    // Pagination
    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get('page')) || 1, 1);
    const limit = Math.min(Number(searchParams.get('limit')) || 10, 50);
    const skip = (page - 1) * limit;

    // Sorting: before close by createdAt, after close by amount DESC then createdAt ASC
    const sort: any = isClosed
      ? { amount: -1, createdAt: 1 }
      : { createdAt: 1 };

    // Query placements
    const placements = await Placement.find({ seetuId: seetuId })
      .populate('userId', 'username')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Placement.countDocuments({ seetuId: seetuId });

    // getAuthUser is already available
    const user = await getAuthUser(request);

    // Format response
    const result = placements.map((p) => ({
      id: p._id.toString(),
      user: (p.userId as any).username,
      amount: isClosed || (user && user.username === (p.userId as any).username)
              ? p.amount
              : undefined, // Hide amount for others
      createdAt: p.createdAt,
    }));

    return NextResponse.json({
      success: true,
      page,
      limit,
      total: totalCount,
      count: result.length,
      placements: result,
    });
  } catch (error) {
    console.error('Get placements error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch placements' },
      { status: 500 }
    );
  }
}

//PATCH - Update placement
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: seetuId } = await params;

    // Validate ObjectId format
    if (!seetuId || seetuId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(seetuId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid seetu ID' },
        { status: 400 }
      );
    }

    // Check if seetu exists and is open
    const seetu = await Seetu.findById(seetuId);
    if (!seetu || seetu.archived) {
      return NextResponse.json(
        { success: false, message: 'Seetu not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    if (now >= seetu.closingDate) {
      return NextResponse.json(
        { success: false, message: 'Seetu is closed. Cannot update placement.' },
        { status: 403 }
      );
    }

    const { amount } = await request.json();
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // ✅ ADD THIS: Validate amount against seetu min/max
    if (seetu.minAmount && amount < seetu.minAmount) {
      return NextResponse.json(
        { success: false, message: `Amount must be at least ${seetu.minAmount}` },
        { status: 400 }
      );
    }

    if (seetu.maxAmount && amount > seetu.maxAmount) {
      return NextResponse.json(
        { success: false, message: `Amount cannot exceed ${seetu.maxAmount}` },
        { status: 400 }
      );
    }

    // Find and update the placement
    const placement = await Placement.findOne({
      seetuId: seetuId,
      userId: user.id,
    });

    if (!placement) {
      return NextResponse.json(
        { success: false, message: 'Placement not found' },
        { status: 404 }
      );
    }

    // Update amount and save (triggers pre-save validation)
    placement.amount = amount;
    await placement.save();

    return NextResponse.json({
      success: true,
      message: 'Placement updated successfully',
      placement: {
        id: placement._id.toString(),
        amount: placement.amount,
      },
    });
  } catch (error: any) {
    console.error('Update placement error:', error);

    // Validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update placement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete placement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: seetuId } = await params;

    // Validate ObjectId format
    if (!seetuId || seetuId.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(seetuId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid seetu ID' },
        { status: 400 }
      );
    }

    // Check if seetu exists and is open
    const seetu = await Seetu.findById(seetuId);
    if (!seetu || seetu.archived) {
      return NextResponse.json(
        { success: false, message: 'Seetu not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    if (now >= seetu.closingDate) {
      return NextResponse.json(
        { success: false, message: 'Seetu is closed. Cannot delete placement.' },
        { status: 403 }
      );
    }

    // Delete the placement
    const deleted = await Placement.findOneAndDelete({
      seetuId: seetuId,
      userId: user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Placement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Placement deleted successfully',
    });
  } catch (error) {
    console.error('Delete placement error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete placement' },
      { status: 500 }
    );
  }
}