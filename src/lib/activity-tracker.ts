import Activity from "@/models/Activity";
import Tool from "@/models/Tool";
import User from "@/models/User";
import { Types } from "mongoose";
import mongoose from "mongoose";

export interface TrackActivityParams {
  userId: string;
  toolId: string;
  type: 'view' | 'like' | 'favorite' | 'share' | 'comment' | 'update';
  message?: string;
}

/**
 * Track user activity and update relevant counters
 */
export async function trackActivity({
  userId,
  toolId,
  type,
  message,
}: TrackActivityParams) {
  try {
    // Validate inputs
    if (!userId || !toolId || !type) {
      console.error("Invalid parameters for activity tracking:", { userId, toolId, type });
      return null;
    }

    const tool = await Tool.findById(toolId);
    const user = await User.findById(userId);
    
    if (!tool || !user) {
      console.error("Tool or user not found:", { toolId, userId, toolFound: !!tool, userFound: !!user });
      return null;
    }
    
    // Create default message if not provided
    let activityMessage = message;
    if (!activityMessage) {
      activityMessage = getDefaultMessage(type, user.name, tool.name);
    }
    
    // Update tool statistics based on activity type
    switch (type) {
      case 'view':
        await updateViewCount(toolId);
        break;
      case 'share':
        await Tool.findByIdAndUpdate(toolId, { $inc: { shares: 1 } });
        break;
      case 'like':
        // Only add to loves array if not already there
        const toolToUpdate = await Tool.findById(toolId);
        if (toolToUpdate) {
          const loves = toolToUpdate.loves || [];
          const alreadyLoved = loves.some((id: mongoose.Types.ObjectId) => id.toString() === userId);
          
          if (!alreadyLoved) {
            console.log(`Adding user ${userId} to loves array for tool ${toolId}`);
            await Tool.findByIdAndUpdate(toolId, { 
              $addToSet: { loves: new Types.ObjectId(userId) } 
            });
          } else {
            console.log(`User ${userId} already in loves array for tool ${toolId}`);
          }
        }
        break;
      case 'favorite':
        // Add to user's favorites if not already there
        await User.findByIdAndUpdate(userId, { 
          $addToSet: { favorites: new Types.ObjectId(toolId) } 
        });
        break;
    }
    
    // Create activity record
    const activity = await Activity.create({
      userId: new Types.ObjectId(userId),
      toolId: new Types.ObjectId(toolId),
      type,
      message: activityMessage,
      timestamp: new Date()
    });
    
    console.log(`Activity tracked: ${type} for tool ${tool.name} by user ${user.name}`);
    return activity;
  } catch (error) {
    console.error("Error tracking activity:", error);
    return null;
  }
}

/**
 * Update view count and view history for a tool
 */
async function updateViewCount(toolId: string) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const tool = await Tool.findById(toolId);
    if (!tool) return;
    
    // Increment total views
    tool.views = (tool.views || 0) + 1;
    
    // Update view history
    const viewHistory = tool.viewHistory || [];
    const todayRecord = viewHistory.find((record: { date: string; count: number }) => record.date === today);
    
    if (todayRecord) {
      todayRecord.count += 1;
    } else {
      viewHistory.push({
        date: today,
        count: 1
      });
    }
    
    tool.viewHistory = viewHistory;
    await tool.save();
  } catch (error) {
    console.error("Error updating view count:", error);
  }
}

/**
 * Generate default activity messages
 */
function getDefaultMessage(
  type: 'view' | 'like' | 'favorite' | 'share' | 'comment' | 'update',
  userName: string,
  toolName: string
): string {
  switch (type) {
    case 'view':
      return `${userName} viewed the tool "${toolName}"`;
    case 'like':
      return `${userName} liked the tool "${toolName}"`;
    case 'favorite':
      return `${userName} added "${toolName}" to favorites`;
    case 'share':
      return `${userName} shared the tool "${toolName}"`;
    case 'comment':
      return `${userName} commented on "${toolName}"`;
    case 'update':
      return `${userName} updated the tool "${toolName}"`;
    default:
      return `${userName} interacted with "${toolName}"`;
  }
}

/**
 * Calculate trend percentage between two values
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Get date range for statistics (last 30 days, previous 30 days)
 */
export function getDateRanges() {
  const today = new Date();
  
  // Last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  // Previous 30 days before that
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(today.getDate() - 60);
  
  return {
    current: {
      start: thirtyDaysAgo,
      end: today
    },
    previous: {
      start: sixtyDaysAgo,
      end: thirtyDaysAgo
    }
  };
} 