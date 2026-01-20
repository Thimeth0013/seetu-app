'use server';

import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import { User } from '@/database';

// Types for user actions
export interface SignupParams {
  username: string;
  password: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    username: string;
    isAdmin: boolean;
  };
  suggestedUsername?: string;
}

//Register a new user - First user automatically becomes admin
export async function signup(params: SignupParams): Promise<UserResponse> {
  try {
    await connectToDatabase();

    const { username, password } = params;

    // Validate input
    if (!username || !password) {
      return {
        success: false,
        message: 'Username and password are required',
      };
    }

    if (username.length < 2 || username.length > 50) {
      return {
        success: false,
        message: 'Username must be between 2 and 50 characters',
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long',
      };
    }

    // Normalize username to lowercase for storage
    const normalizedUsername = username.trim().toLowerCase();

    // Check if username already exists
    const existingUser = await User.findOne({ 
      username: normalizedUsername
    });

    if (existingUser) {
      // Suggest alternative usernames
      let counter = 2;
      let suggestedUsername = `${username}${counter}`;
      
      while (await User.findOne({ username: suggestedUsername.toLowerCase() })) {
        counter++;
        suggestedUsername = `${username}${counter}`;
        if (counter > 10) break; // Prevent infinite loop
      }

      return {
        success: false,
        message: `Username '${username}' already exists`,
        suggestedUsername: counter <= 10 ? suggestedUsername : undefined,
      };
    }

    // Check if this is the first user (will become admin)
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user (store username in lowercase)
    const newUser = await User.create({
      username: normalizedUsername,
      passwordHash,
      isAdmin: isFirstUser,
    });

    return {
      success: true,
      message: isFirstUser 
        ? 'Account created successfully! You are now the admin.' 
        : 'Account created successfully!',
      user: {
        id: newUser._id.toString(),
        username: newUser.username,
        isAdmin: newUser.isAdmin,
      },
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: 'An error occurred during signup. Please try again.',
    };
  }
}

// Login existing user
export async function login(params: LoginParams): Promise<UserResponse> {
  try {
    await connectToDatabase();

    const { username, password } = params;

    // Validate input
    if (!username || !password) {
      return {
        success: false,
        message: 'Username and password are required',
      };
    }

    // Normalize username to lowercase
    const normalizedUsername = username.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ 
      username: normalizedUsername
    });

    if (!user) {
      return {
        success: false,
        message: 'Username or password is incorrect',
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Username or password is incorrect',
      };
    }

    return {
      success: true,
      message: 'Login successful!',
      user: {
        id: user._id.toString(),
        username: user.username,
        isAdmin: user.isAdmin,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login. Please try again.',
    };
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId).select('-passwordHash');

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// Check if username is available (duplicate check)
export async function checkUsernameAvailability(username: string) {
  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ 
      username: username.trim().toLowerCase() 
    });

    return {
      available: !existingUser,
      username: username.trim(),
    };
  } catch (error) {
    console.error('Username check error:', error);
    return {
      available: false,
      username: username.trim(),
    };
  }
}

// Update a user's password by ID (admin)
export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    await connectToDatabase();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword.trim(), salt);

    const updated = await User.findByIdAndUpdate(
      userId,
      { passwordHash },
      { new: true }
    );

    return !!updated;
  } catch (error) {
    console.error('Update user password error:', error);
    return false;
  }
}

// Update a user's role by ID
export async function updateUserRole(userId: string, isAdmin: boolean) {
  try {
    await connectToDatabase();

    const updated = await User.findByIdAndUpdate(
      userId,
      { isAdmin },
      { new: true }
    );

    if (!updated) return null;

    return {
      id: updated._id.toString(),
      username: updated.username,
      isAdmin: updated.isAdmin,
    };
  } catch (error) {
    console.error('Update user role error:', error);
    return null;
  }
}

// Delete a user by ID
export async function deleteUserById(userId: string) {
  try {
    await connectToDatabase();

    const deleted = await User.findByIdAndDelete(userId);

    return !!deleted;
  } catch (error) {
    console.error('Delete user error:', error);
    return false;
  }
}

// Update a user's username by ID
export async function updateUsernameById(userId: string, newUsername: string) {
  try {
    await connectToDatabase();

    // Normalize to lowercase
    const normalizedUsername = newUsername.trim().toLowerCase();

    const updated = await User.findByIdAndUpdate(
      userId,
      { username: normalizedUsername },
      { new: true }
    );

    if (!updated) return null;

    return {
      id: updated._id.toString(),
      username: updated.username,
      isAdmin: updated.isAdmin,
    };
  } catch (error) {
    console.error('Update username error:', error);
    return null;
  }
}
