import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/models/User';
import { trackActivity } from '@/lib/activity-tracker';

// Get a specific tool
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // In Next.js API routes, params may be a Promise, so we need to await it
    const id = await params.id;
    
    const tool = await Tool.findById(id)
      .populate('author', 'name email avatar');
    
    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Track view - Try to get user for logging the activity
    try {
      const user = getUserFromRequest(req);
      if (user) {
        // Track view as the authenticated user
        console.log(`Tracking authenticated view for tool ${id} by user ${user.id}`);
        await trackActivity({
          userId: user.id,
          toolId: id,
          type: 'view'
        });
      } else {
        // Anonymous view - increment the view count directly
        console.log(`Tracking anonymous view for tool ${id}`);
        
        // Update total view count
        await Tool.findByIdAndUpdate(id, {
          $inc: { views: 1 }
        });
        
        // Update the view history for today
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Try to update existing record for today if it exists
        const updateResult = await Tool.updateOne(
          { 
            _id: id, 
            'viewHistory.date': today 
          },
          { 
            $inc: { 'viewHistory.$.count': 1 } 
          }
        );
        
        // If no record exists for today, create one
        if (updateResult.matchedCount === 0) {
          await Tool.findByIdAndUpdate(
            id,
            {
              $push: { 
                viewHistory: { 
                  date: today, 
                  count: 1 
                } 
              }
            }
          );
        }
      }
    } catch (trackError: unknown) {
      // Log but don't fail the request if tracking fails
      console.error('Failed to track view:', trackError instanceof Error ? trackError.message : String(trackError));
    }

    return NextResponse.json(tool);
  } catch (error: unknown) {
    console.error('Tool fetch error:', error);
    return NextResponse.json(
      { error: 'Error fetching tool' },
      { status: 500 }
    );
  }
}

// Update a tool
export async function PUT(
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

    // Find the tool
    const tool = await Tool.findById(id);
    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (tool.author.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this tool' },
        { status: 403 }
      );
    }

    const updateData = await req.json();
    
    // Update the tool
    const updatedTool = await Tool.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('author', 'name email avatar');

    // Track update activity
    await trackActivity({
      userId: user.id,
      toolId: id,
      type: 'update',
      message: `${user.name} updated the tool "${tool.name}"`
    });

    return NextResponse.json(updatedTool);
  } catch (error: unknown) {
    console.error('Tool update error:', error);
    return NextResponse.json(
      { error: 'Error updating tool' },
      { status: 500 }
    );
  }
}

// Delete a tool
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

    // Find the tool
    const tool = await Tool.findById(id);
    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (tool.author.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this tool' },
        { status: 403 }
      );
    }

    // Delete the tool
    await Tool.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Tool deleted successfully'
    });
  } catch (error: unknown) {
    console.error('Tool deletion error:', error);
    return NextResponse.json(
      { error: 'Error deleting tool' },
      { status: 500 }
    );
  }
} 