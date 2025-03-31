import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Tool from '@/models/Tool';
import { getUserFromRequest } from '@/lib/auth';
import { trackActivity } from '@/lib/activity-tracker';
import { type NextRequest } from 'next/server';

// Add a tool to user's favorites
export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // In Next.js API routes, params may be a Promise, so we need to await it
    const id = context.params.id;
    
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

    // Add to favorites if not already added
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        $addToSet: { favorites: id }
      },
      { new: true }
    );

    // Track favorite activity
    await trackActivity({
      userId: user.id,
      toolId: id,
      type: 'favorite',
      message: `${user.name} added "${tool.name}" to favorites`
    });

    return NextResponse.json({
      success: true,
      message: 'Tool added to favorites'
    });
  } catch (error: unknown) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Error adding favorite' },
      { status: 500 }
    );
  }
}

// Remove a tool from user's favorites
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // In Next.js API routes, params may be a Promise, so we need to await it
    const id = context.params.id;
    
    // Get the user from the request
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get tool for activity tracking
    const tool = await Tool.findById(id);
    if (tool) {
      // Track unfavorite activity
      await trackActivity({
        userId: user.id,
        toolId: id,
        type: 'favorite', // Use same type but message indicates removal
        message: `${user.name} removed "${tool.name}" from favorites`
      });
    }

    // Remove from favorites
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        $pull: { favorites: id }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Tool removed from favorites'
    });
  } catch (error: unknown) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { error: 'Error removing favorite' },
      { status: 500 }
    );
  }
} 