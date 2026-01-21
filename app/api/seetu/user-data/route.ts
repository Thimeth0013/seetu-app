import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Seetu from '@/database/seetu.model';
import Placement from '@/database/placement.model';

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

    // Fetch all placements for these seetus with populated user data
    const seetuIds = seetus.map(s => s._id);
    const placements = await Placement.find({ seetuId: { $in: seetuIds } })
      .populate('userId', 'username')
      .lean();

    // Group placements by seetuId
    const placementsBySeetuId = placements.reduce((acc: any, placement: any) => {
      const seetuId = placement.seetuId.toString();
      if (!acc[seetuId]) {
        acc[seetuId] = [];
      }
      acc[seetuId].push({
        id: placement._id.toString(),
        userId: placement.userId._id.toString(),
        username: placement.userId.username, // Get username from populated field
        amount: placement.amount,
        createdAt: placement.createdAt,
      });
      return acc;
    }, {});

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

      const seetuId = s._id.toString();

      return {
        id: seetuId,
        title: s.title,
        openingDate: s.openingDate,
        closingDate: s.closingDate,
        minAmount: s.minAmount,
        maxAmount: s.maxAmount,
        createdBy: s.createdBy.toString(),
        status: derivedStatus,
        placements: placementsBySeetuId[seetuId] || [],
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