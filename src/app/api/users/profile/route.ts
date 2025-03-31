import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Tool from '@/models/Tool';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userProfile = await User.findById(user.id)
      .select('-password')
      .populate('tools')
      .populate('favorites');

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile);
  } catch (error: unknown) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Error fetching profile' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { name, bio, avatar } = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: { name, bio, avatar } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Delete user's tools
    await Tool.deleteMany({ author: user.id });

    // Delete user
    await User.findByIdAndDelete(user.id);

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: unknown) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Error deleting account' },
      { status: 500 }
    );
  }
} 