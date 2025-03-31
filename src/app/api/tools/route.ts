import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await connectDB();
    const user = getUserFromRequest(req as Request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const {
      name,
      shortDescription,
      description,
      deployedUrl,
      repositoryUrl,
      tags,
      image,
    } = await req.json();

    // Validate required fields
    if (!name || !shortDescription || !description || !deployedUrl || !image) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Create new tool
    const tool = await Tool.create({
      name,
      shortDescription,
      description,
      deployedUrl,
      repositoryUrl,
      tags: tags || [],
      image,
      author: user.id,
    });

    return NextResponse.json(tool, { status: 201 });
  } catch (error: unknown) {
    console.error('Tool creation error:', error);
    return NextResponse.json(
      { error: 'Error creating tool' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    // Build query
    const query: Record<string, any> = {};
    if (tag) {
      query.tags = tag;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await Tool.countDocuments(query);

    // Get tools with pagination
    const tools = await Tool.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name email avatar');

    return NextResponse.json({
      tools,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    console.error('Tool fetch error:', error);
    return NextResponse.json(
      { error: 'Error fetching tools' },
      { status: 500 }
    );
  }
} 