import { NextRequest } from 'next/server';
import { getUserById } from './actions/user.actions';

export interface AuthUser {
  id: string;
  username: string;
  isAdmin: boolean;
}

//Get authenticated user from request - Checks for userId in cookies
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return null;
    }

    const user = await getUserById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

//Require authentication - throws error if not authenticated
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request);

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

//Require admin role - throws error if not admin
export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (!user.isAdmin) {
    throw new Error('Admin privileges required');
  }

  return user;
}