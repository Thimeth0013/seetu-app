import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getUserById, updateUserRole } from '@/lib/actions/user.actions';

export async function PATCH(request: NextRequest) {
  try {
    // Only admin can perform this
    const admin = await requireAdmin(request);

    const { userId, isAdmin } = await request.json();

    if (!userId || typeof isAdmin !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'userId and isAdmin (boolean) required' },
        { status: 400 }
      );
    }

    // Prevent admin from changing own role
    if (admin.id === userId) {
      return NextResponse.json(
        { success: false, message: 'Cannot modify your own role' },
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

    await updateUserRole(userId, isAdmin);

    return NextResponse.json({
      success: true,
      message: `User ${user.username} role updated to ${isAdmin ? 'admin' : 'user'}`,
    });
  } catch (error) {
    console.error('Admin role change error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
