import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/actions/user.actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const result = await login({ username, password });

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    // Create response with user data
    const response = NextResponse.json(result, { status: 200 });

    // Set HTTP-only cookie for session (optional - can also use client-side storage)
    // This is more secure but requires additional session management
    if (result.user) {
      response.cookies.set('userId', result.user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}