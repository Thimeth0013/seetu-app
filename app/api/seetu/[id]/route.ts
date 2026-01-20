import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Seetu from '@/database/seetu.model';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId format
    if (!id || id.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Seetu ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const seetu = await Seetu.findById(id).lean();

    if (!seetu || seetu.archived) {
      return NextResponse.json(
        { success: false, message: 'Seetu not found' },
        { status: 404 }
      );
    }

    const now = new Date();

    let status: 'upcoming' | 'open' | 'closed';
    if (now < new Date(seetu.openingDate)) {
      status = 'upcoming';
    } else if (now > new Date(seetu.closingDate)) {
      status = 'closed';
    } else {
      status = 'open';
    }

    return NextResponse.json(
      {
        success: true,
        seetu: {
          id: seetu._id.toString(),
          title: seetu.title,
          openingDate: seetu.openingDate,
          closingDate: seetu.closingDate,
          minAmount: seetu.minAmount,
          maxAmount: seetu.maxAmount,
          createdBy: seetu.createdBy.toString(),
          status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get seetu by id error:', error);

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}