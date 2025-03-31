import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tool from '@/models/Tool';
import User from '@/models/User';
import Activity from '@/models/Activity';
import { calculateTrend, getDateRanges } from '@/lib/activity-tracker';
import { Types } from 'mongoose';
import { getUserFromRequest } from '@/lib/auth';

// Format relative time for activities (e.g., "2 hours ago")
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  
  if (diffMonth > 0) {
    return diffMonth === 1 ? '1 month ago' : `${diffMonth} months ago`;
  } else if (diffWeek > 0) {
    return diffWeek === 1 ? '1 week ago' : `${diffWeek} weeks ago`;
  } else if (diffDay > 0) {
    return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
  } else if (diffHour > 0) {
    return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
  } else if (diffMin > 0) {
    return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  } else {
    return 'Just now';
  }
}

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Get the user from the request
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // The userId from JWT token is 'id'
    const userId = user.id;
    
    // Validate user exists in database
    const dbUser = await User.findById(userId);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }
    
    const { current, previous } = getDateRanges();
    
    // Get user's tools
    const userTools = await Tool.find({ author: userId });
    console.log(`Found ${userTools.length} tools for user ${userId}`);
    
    // Log the first tool's data to help with debugging
    if (userTools.length > 0) {
      const sampleTool = userTools[0];
      console.log('Sample tool data:', {
        id: sampleTool._id,
        name: sampleTool.name,
        views: sampleTool.views,
        loves: Array.isArray(sampleTool.loves) ? sampleTool.loves.length : 'not an array',
        shares: sampleTool.shares
      });
    }
    
    const toolIds = userTools.map(tool => tool._id);
    
    // Calculate view statistics
    const currentViews = await Activity.countDocuments({
      toolId: { $in: toolIds },
      type: 'view',
      timestamp: { $gte: current.start, $lte: current.end }
    });
    
    const previousViews = await Activity.countDocuments({
      toolId: { $in: toolIds },
      type: 'view',
      timestamp: { $gte: previous.start, $lte: previous.end }
    });
    
    // Calculate like statistics
    const currentLikes = await Activity.countDocuments({
      toolId: { $in: toolIds },
      type: 'like',
      timestamp: { $gte: current.start, $lte: current.end }
    });
    
    const previousLikes = await Activity.countDocuments({
      toolId: { $in: toolIds },
      type: 'like',
      timestamp: { $gte: previous.start, $lte: previous.end }
    });
    
    // Calculate share statistics
    const currentShares = await Activity.countDocuments({
      toolId: { $in: toolIds },
      type: 'share',
      timestamp: { $gte: current.start, $lte: current.end }
    });
    
    const previousShares = await Activity.countDocuments({
      toolId: { $in: toolIds },
      type: 'share',
      timestamp: { $gte: previous.start, $lte: previous.end }
    });
    
    // Calculate total statistics
    const totalViews = userTools.reduce((sum, tool) => {
      return sum + (tool.views || 0);
    }, 0);
    
    const totalLikes = userTools.reduce((sum, tool) => {
      // Handle the case where loves might be undefined or not an array
      return sum + (Array.isArray(tool.loves) ? tool.loves.length : 0);
    }, 0);
    
    const totalShares = userTools.reduce((sum, tool) => {
      return sum + (tool.shares || 0);
    }, 0);
    
    console.log('Total stats:', { totalViews, totalLikes, totalShares, toolCount: userTools.length });
    
    // Calculate trends
    const viewsTrend = calculateTrend(currentViews, previousViews);
    const likesTrend = calculateTrend(currentLikes, previousLikes);
    const sharesTrend = calculateTrend(currentShares, previousShares);
    
    // Get recent activities
    const recentActivities = await Activity.find({
      $or: [
        { userId: userId }, // Activities by the user
        { toolId: { $in: toolIds } } // Activities on user's tools
      ]
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .populate('toolId', 'name')
    .lean();
    
    // Format activities for frontend
    const activities = recentActivities.map(activity => {
      // Define a type for populated tool
      interface PopulatedTool {
        _id: Types.ObjectId;
        name: string;
      }
      
      return {
        id: (activity._id as unknown as Types.ObjectId).toString(),
        type: activity.type,
        message: activity.message,
        time: formatRelativeTime(new Date(activity.timestamp)),
        timestamp: new Date(activity.timestamp).getTime(),
        toolId: activity.toolId && typeof activity.toolId === 'object' 
          ? (activity.toolId as PopulatedTool)._id?.toString() 
          : undefined,
        toolName: activity.toolId && typeof activity.toolId === 'object' 
          ? (activity.toolId as PopulatedTool).name 
          : undefined
      };
    });
    
    // Get trending tools (top tools with most views/likes growth in the last 30 days)
    const allTools = await Tool.find()
      .sort({ views: -1 })
      .limit(50)
      .lean();
    
    // Log data for debugging
    console.debug(`Dashboard stats: Found ${userTools.length} user tools, ${recentActivities.length} recent activities, ${allTools.length} tools for trending analysis`);
    
    // Define a type for view history record
    interface ViewHistoryRecord {
      date: Date;
      count: number;
    }
    
    // Calculate trends for each tool
    const trendingTools = allTools.map(tool => {
      // Calculate view trend based on view history
      const viewHistory = tool.viewHistory || [];
      const currentMonthViews = viewHistory
        .filter((record: ViewHistoryRecord) => {
          const recordDate = new Date(record.date);
          return recordDate >= current.start && recordDate <= current.end;
        })
        .reduce((sum: number, record: ViewHistoryRecord) => sum + record.count, 0);
      
      const previousMonthViews = viewHistory
        .filter((record: ViewHistoryRecord) => {
          const recordDate = new Date(record.date);
          return recordDate >= previous.start && recordDate <= previous.end;
        })
        .reduce((sum: number, record: ViewHistoryRecord) => sum + record.count, 0);
      
      const trend = calculateTrend(currentMonthViews, previousMonthViews);
      
      // Extract main category from tags
      const category = tool.tags && tool.tags.length > 0 ? tool.tags[0] : 'Other';
      
      return {
        id: (tool._id as unknown as Types.ObjectId).toString(),
        name: tool.name,
        views: tool.views || 0,
        likes: Array.isArray(tool.loves) ? tool.loves.length : 0,
        category,
        trend
      };
    })
    .filter(tool => tool.trend !== 0) // Filter out tools with no trend
    .sort((a, b) => b.trend - a.trend) // Sort by trend (highest first)
    .slice(0, 5); // Take top 5
    
    // Prepare the final response
    const response = {
      views: {
        total: totalViews,
        trend: viewsTrend
      },
      likes: {
        total: totalLikes,
        trend: likesTrend
      },
      shares: {
        total: totalShares,
        trend: sharesTrend
      },
      activities,
      trendingTools
    };
    
    console.debug("Sending dashboard stats response:", JSON.stringify(response, null, 2));
    
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Error retrieving dashboard statistics' },
      { status: 500 }
    );
  }
} 