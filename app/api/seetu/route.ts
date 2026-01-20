import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Seetu from '@/database/seetu.model';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const now = new Date();
    const query: any = {};

    // Status filtering
    if (status === 'archived') {
      query.archived = true;
    } else {
      // Default: only show non-archived
      query.archived = { $ne: true };

      // Time-based filtering for non-archived seetus
      if (status === 'upcoming') {
        query.openingDate = { $gt: now };
      } else if (status === 'open') {
        query.openingDate = { $lte: now };
        query.closingDate = { $gte: now };
      } else if (status === 'closed') {
        query.closingDate = { $lt: now };
      }
    }

    const seetus = await Seetu.find(query)
      .sort({ openingDate: -1 })
      .lean();

    const result = seetus.map((s) => {
      let derivedStatus: 'upcoming' | 'open' | 'closed' | 'archived';

      if (s.archived) {
        derivedStatus = 'archived';
      } else if (now < new Date(s.openingDate)) {
        derivedStatus = 'upcoming';
      } else if (now > new Date(s.closingDate)) {
        derivedStatus = 'closed';
      } else {
        derivedStatus = 'open';
      }

      return {
        id: s._id.toString(),
        title: s.title,
        openingDate: s.openingDate,
        closingDate: s.closingDate,
        minAmount: s.minAmount,
        maxAmount: s.maxAmount,
        createdBy: s.createdBy.toString(),
        status: derivedStatus,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: result.length,
        seetus: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get all seetus error:', error);

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}