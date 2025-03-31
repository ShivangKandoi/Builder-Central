import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    
    // Get the user from the request
    const user = getUserFromRequest(req as any);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch tools created by the user
    const tools = await Tool.find({ author: user.id })
      .sort({ createdAt: -1 })
      .populate('author', 'name email avatar');

    return NextResponse.json({ tools });
  } catch (error: any) {
    console.error('User tools fetch error:', error);
    return NextResponse.json(
      { error: 'Error fetching user tools' },
      { status: 500 }
    );
  }
} 