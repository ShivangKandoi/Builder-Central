import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getUserFromRequest } from '@/lib/auth';
import { trackActivity } from '@/lib/activity-tracker';
import { Types } from 'mongoose';

// Like a tool
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // In Next.js API routes, params may be a Promise, so we need to await it
    const id = await params.id;
    
    // Get the user from the request
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if tool exists
    const tool = await Tool.findById(id);
    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Check if user already liked the tool
    const loves = tool.loves || [];
    const alreadyLoved = loves.some((loveId: Types.ObjectId) => loveId.toString() === user.id);
    
    if (alreadyLoved) {
      return NextResponse.json({
        success: true,
        message: 'Tool already liked',
        alreadyLiked: true
      });
    }

    // Add user to loves array
    await Tool.findByIdAndUpdate(
      id,
      {
        $addToSet: { loves: new Types.ObjectId(user.id) }
      }
    );

    // Track like activity
    await trackActivity({
      userId: user.id,
      toolId: id,
      type: 'like',
      message: `${user.name} liked the tool "${tool.name}"`
    });

    return NextResponse.json({
      success: true,
      message: 'Tool liked successfully'
    });
  } catch (error: unknown) {
    console.error('Like tool error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error liking tool' },
      { status: 500 }
    );
  }
}

// Unlike a tool
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // In Next.js API routes, params may be a Promise, so we need to await it
    const id = await params.id;
    
    // Get the user from the request
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if tool exists
    const tool = await Tool.findById(id);
    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Remove user from loves array
    await Tool.findByIdAndUpdate(
      id,
      {
        $pull: { loves: user.id }
      }
    );

    // Track unlike activity
    await trackActivity({
      userId: user.id,
      toolId: id,
      type: 'like', // Using same type but message shows unlike
      message: `${user.name} unliked the tool "${tool.name}"`
    });

    return NextResponse.json({
      success: true,
      message: 'Tool unliked successfully'
    });
  } catch (error: unknown) {
    console.error('Unlike tool error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error unliking tool' },
      { status: 500 }
    );
  }
} 