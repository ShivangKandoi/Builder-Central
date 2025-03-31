import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await connectDB();
    // Get request data, destructuring username to handle legacy requests but we won't use it
    const { name, email, password, username } = await req.json();

    // Use the proper name field (could fall back to username if needed, but we're not using username)
    const finalName = name;

    // Validate input
    if (!finalName || !email || !password) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user - explicitly using 'name' field not 'username'
    const user = await User.create({
      name: finalName,
      email,
      password,
    });

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token
    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
} 