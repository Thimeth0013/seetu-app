import { NextRequest, NextResponse } from 'next/server';
import { checkUsernameAvailability } from '@/lib/actions/user.actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Username is required' 
        },
        { status: 400 }
      );
    }

    const result = await checkUsernameAvailability(username);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Check username API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}