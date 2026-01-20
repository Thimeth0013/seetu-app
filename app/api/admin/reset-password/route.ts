import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getUserById, updateUserPassword } from '@/lib/actions/user.actions';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'userId and newPassword required' },
        { status: 400 }
      );
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    await updateUserPassword(userId, newPassword);

    return NextResponse.json(
      { success: true, message: `Password reset for ${user.username}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
