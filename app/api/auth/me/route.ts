import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { deleteUserById, updateUsernameById, checkUsernameAvailability } from '@/lib/actions/user.actions';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Not authenticated',
          user: null
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        user: null
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    await deleteUserById(user.id);

    const response = NextResponse.json(
      { success: true, message: 'Account deleted successfully' },
      { status: 200 }
    );

    // Remove session cookie
    response.cookies.delete({
      name: 'userId',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { newUsername } = await request.json();

    if (!newUsername) {
      return NextResponse.json(
        { success: false, message: 'New username is required' },
        { status: 400 }
      );
    }

    const availability = await checkUsernameAvailability(newUsername);
    if (!availability.available) {
      return NextResponse.json(
        { success: false, message: 'Username is already taken' },
        { status: 409 }
      );
    }

    await updateUsernameById(user.id, newUsername);

    return NextResponse.json(
      { success: true, message: 'Username updated successfully', username: newUsername },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update username error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}