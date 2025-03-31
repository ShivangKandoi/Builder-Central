import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getUserFromRequest } from '@/lib/auth';
import { type NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { action, rating, comment } = await req.json();
    const tool = await Tool.findById(context.params.id);

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'rate':
        if (!rating || rating < 1 || rating > 5) {
          return NextResponse.json(
            { error: 'Invalid rating value' },
            { status: 400 }
          );
        }

        // Remove existing rating if any
        tool.ratings = tool.ratings.filter(
          (r: any) => r.userId.toString() !== user.id
        );

        // Add new rating
        tool.ratings.push({
          userId: user.id,
          rating,
        });
        break;

      case 'love':
        const loveIndex = tool.loves.indexOf(user.id);
        if (loveIndex === -1) {
          tool.loves.push(user.id);
        } else {
          tool.loves.splice(loveIndex, 1);
        }
        break;

      case 'comment':
        if (!comment || comment.trim().length === 0) {
          return NextResponse.json(
            { error: 'Comment cannot be empty' },
            { status: 400 }
          );
        }

        tool.comments.push({
          userId: user.id,
          content: comment.trim(),
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    await tool.save();

    return NextResponse.json(tool);
  } catch (error: unknown) {
    console.error('Tool interaction error:', error);
    return NextResponse.json(
      { error: 'Error processing tool interaction' },
      { status: 500 }
    );
  }
} 