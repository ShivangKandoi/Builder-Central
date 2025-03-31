'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Heart, 
  Eye, 
  Star, 
  Link as LinkIcon, 
  MessageSquare, 
  RefreshCw, 
  Clock,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'like' | 'view' | 'favorite' | 'share' | 'comment' | 'update';
  message: string;
  time: string;
  timestamp: number;
  toolId?: string;
  toolName?: string;
}

export default function ActivityPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    if (!user || !token) {
      router.replace('/login?from=/dashboard/activity');
      return;
    }

    // Fetch user's activity
    const fetchActivityData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard statistics that includes activities
        const statsResponse = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setActivities(statsData.activities || []);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivityData();
  }, [user, token, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
        <div className="relative inline-flex items-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <div className="ml-4 text-xl font-medium text-foreground">Loading activities...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This should not render as the useEffect will redirect
  }

  return (
    <div className="container mx-auto px-4 space-y-6 pb-16 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activity History</h1>
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">All Activities</h2>
        </div>
        <div className="p-4">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}

// Activity Feed Component 
function ActivityFeed({ activities }: { activities: Activity[] }) {
  // Get the icon based on activity type
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'like': return <Heart className="h-4 w-4 text-red-500" />;
      case 'view': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'favorite': return <Star className="h-4 w-4 text-amber-500" />;
      case 'share': return <LinkIcon className="h-4 w-4 text-green-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'update': return <RefreshCw className="h-4 w-4 text-cyan-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-10">
        <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">No activity yet</h3>
        <p className="text-muted-foreground mb-4">
          Your activity will appear here as you interact with tools.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="p-4 rounded-lg hover:bg-muted transition-colors border border-border/50">
          <div className="flex items-start">
            <div className="mt-0.5 mr-3 p-2 rounded-full bg-primary/5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-2">{activity.time}</p>
              {activity.toolId && activity.toolName && (
                <Link 
                  href={`/tools/${activity.toolId}`}
                  className="text-xs text-primary hover:underline inline-flex items-center mt-2"
                >
                  View {activity.toolName} <ChevronRight className="h-3 w-3 ml-0.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 