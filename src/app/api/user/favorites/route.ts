import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
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

    // Fetch the user with populated favorites
    const userWithFavorites = await User.findById(user.id)
      .populate({
        path: 'favorites',
        populate: {
          path: 'author',
          select: 'name email avatar'
        }
      });

    if (!userWithFavorites) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      favorites: userWithFavorites.favorites || [] 
    });
  } catch (error: any) {
    console.error('User favorites fetch error:', error);
    return NextResponse.json(
      { error: 'Error fetching user favorites' },
      { status: 500 }
    );
  }
} 