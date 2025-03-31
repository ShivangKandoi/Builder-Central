import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getUserFromRequest } from '@/lib/auth';
import { trackActivity } from '@/lib/activity-tracker';
import { type NextRequest } from 'next/server';

// Track when a user shares a tool
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // In Next.js API routes, params may be a Promise, so we need to await it
    const id = await params.id;
    
    // Check if tool exists
    const tool = await Tool.findById(id);
    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Get request body for share platform information
    let platform;
    try {
      const body = await req.json();
      platform = body.platform;
    } catch (error) {
      console.warn('Unable to parse request body, continuing without platform info');
    }
    
    // Try to get user info if authenticated
    const user = getUserFromRequest(req);
    
    if (user) {
      // Authenticated share - track full activity
      console.log(`Authenticated share by user ${user.id} for tool ${id}`);
      
      const activity = await trackActivity({
        userId: user.id,
        toolId: id,
        type: 'share',
        message: `${user.name} shared the tool "${tool.name}"${platform ? ` on ${platform}` : ''}`
      });
      
      if (!activity) {
        console.error(`Failed to create activity record for share. UserId: ${user.id}, ToolId: ${id}`);
      }
    } else {
      console.log(`Anonymous share for tool ${id}`);
      // Anonymous share - just increment counter
      await Tool.findByIdAndUpdate(id, {
        $inc: { shares: 1 }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Share recorded successfully'
    });
  } catch (error: unknown) {
    console.error('Share tracking error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 