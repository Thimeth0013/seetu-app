import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/database/user.model';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  await connectToDatabase();

  const admin = await requireAdmin(request);
  if (!admin || !admin.isAdmin) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  const users = await User.find().select('username isAdmin').lean();

  return NextResponse.json({
    success: true,
    users: users.map((u) => ({
      id: u._id.toString(),
      username: u.username,
      isAdmin: u.isAdmin,
    })),
  });
}
