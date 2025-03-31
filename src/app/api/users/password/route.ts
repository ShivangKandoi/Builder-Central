import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    await connectDB();
    const user = getUserFromRequest(req as any);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Please provide both current and new password' },
        { status: 400 }
      );
    }

    // Find user
    const userDoc = await User.findById(user.id);
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isMatch = await userDoc.comparePassword(currentPassword);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update password
    userDoc.password = newPassword;
    await userDoc.save();

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'Error updating password' },
      { status: 500 }
    );
  }
} 