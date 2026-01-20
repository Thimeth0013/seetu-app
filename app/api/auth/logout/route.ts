import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'Logged out successfully' 
      },
      { status: 200 }
    );

    // Clear the userId cookie
    response.cookies.delete('userId');

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}