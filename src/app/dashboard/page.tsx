'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import NewToolModal from '@/components/NewToolModal';
import { AuroraText } from '@/components/magicui/aurora-text';
import SparklesCore from '@/components/magicui/sparkles-core';
import { 
  Plus,
  Shapes,
  BookMarked,
  User,
  BadgePlus,
  Layers,
  Star,
  Heart,
  Globe,
  Link as LinkIcon,
  ExternalLink, 
  Eye,
  RefreshCw,
  MessageSquare,
  ArrowUp,
  Clock,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Define interfaces for type safety
interface Tool {
  _id: string;
  name: string;
  shortDescription: string;
  image: string;
  deployedUrl: string;
  tags: string[];
  views: number;
  loves: string[];
  shares: number;
  author: {
    name: string;
    email: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  id: string;
  type: 'like' | 'view' | 'favorite' | 'share' | 'comment' | 'update';
  message: string;
  time: string;
  timestamp: number;
  toolId?: string;
  toolName?: string;
}

interface TrendingTool {
  id: string;
  name: string;
  views: number;
  likes: number;
  category: string;
  trend: number; // percentage increase
}

interface DashboardStats {
  views: {
    total: number;
    trend: number;
  };
  likes: {
    total: number;
    trend: number;
  };
  shares: {
    total: number;
    trend: number;
  };
  activities: Activity[];
  trendingTools: TrendingTool[];
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userTools, setUserTools] = useState<Tool[]>([]);
  const [favorites, setFavorites] = useState<Tool[]>([]);
  const [showNewToolModal, setShowNewToolModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    views: { total: 0, trend: 0 },
    likes: { total: 0, trend: 0 },
    shares: { total: 0, trend: 0 },
    activities: [],
    trendingTools: []
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!user || !token) {
      router.replace('/login?from=/dashboard');
      return;
    }

    // Fetch user's tools, favorites, and dashboard stats
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Fetch user's tools
        const toolsResponse = await fetch('/api/tools/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        let toolsData = { tools: [] };
        if (toolsResponse.ok) {
          toolsData = await toolsResponse.json();
          setUserTools(toolsData.tools || []);
        }

        // Fetch user's favorites
        const favoritesResponse = await fetch('/api/user/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (favoritesResponse.ok) {
          const favoritesData = await favoritesResponse.json();
          setFavorites(favoritesData.favorites || []);
        }

        // Fetch dashboard statistics
        const statsResponse = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log("Dashboard stats raw data:", statsData);
          
          // Check if the required properties exist
          const hasViews = statsData.views && typeof statsData.views.total === 'number';
          const hasLikes = statsData.likes && typeof statsData.likes.total === 'number';
          const hasShares = statsData.shares && typeof statsData.shares.total === 'number';
          
          console.log("Stats validation:", { hasViews, hasLikes, hasShares });
          
          // Set dashboard stats from API response with fallbacks to 0
          setDashboardStats({
            views: {
              total: hasViews ? statsData.views.total : 0,
              trend: hasViews ? statsData.views.trend : 0
            },
            likes: {
              total: hasLikes ? statsData.likes.total : 0,
              trend: hasLikes ? statsData.likes.trend : 0
            },
            shares: {
              total: hasShares ? statsData.shares.total : 0,
              trend: hasShares ? statsData.shares.trend : 0
            },
            activities: statsData.activities || [],
            trendingTools: statsData.trendingTools || []
          });
        } else {
          // Log error details
          console.error('Failed to fetch dashboard stats:', statsResponse.status, statsResponse.statusText);
          try {
            const errorData = await statsResponse.json();
            console.error('Error response:', errorData);
          } catch (e) {
            console.error('Could not parse error response');
          }
          
          // Fallback: Calculate stats from user tools if API fails
          if (toolsData.tools && toolsData.tools.length > 0) {
            const totalViews = toolsData.tools.reduce((sum: number, tool: Tool) => sum + (tool.views || 0), 0);
            const totalLikes = toolsData.tools.reduce((sum: number, tool: Tool) => sum + (tool.loves?.length || 0), 0);
            const totalShares = toolsData.tools.reduce((sum: number, tool: Tool) => sum + (tool.shares || 0), 0);
            
            setDashboardStats(prev => ({
              ...prev,
              views: { total: totalViews, trend: 5 },
              likes: { total: totalLikes, trend: 3 },
              shares: { total: totalShares, trend: 2 }
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, token, router]);

  const handleNewToolClick = () => {
    setShowNewToolModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowNewToolModal(false);
  };

  // Handle after tool creation - refresh the tools list
  const handleToolCreated = async () => {
    // Close modal
    setShowNewToolModal(false);
    
    try {
      // Refresh user tools
      const response = await fetch('/api/tools/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserTools(data.tools || []);
      }
    } catch (error) {
      console.error('Error refreshing tools:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
        <div className="relative inline-flex items-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <div className="ml-4 text-xl font-medium text-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This should not render as the useEffect will redirect
  }

  return (
    <div className="container mx-auto px-4 space-y-8 pb-16 max-w-7xl">
      {/* Hero section with welcome message */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 p-6 sm:p-8 shadow-sm">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <SparklesCore
            id="sparkles-core"
            background="transparent"
            minSize={0.4}
            maxSize={1.5}
            particleColor="#8b5cf6"
            particleCount={30}
            speed={0.3}
          />
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, <AuroraText>{user.name}</AuroraText></h1>
            <p className="text-foreground/80">
              Create, share, and discover amazing tools with Builder Central
            </p>
          </div>
          <Button 
            onClick={handleNewToolClick}
            size="lg"
            className="shadow-md hover:shadow-primary/20 transition-all group"
          >
            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
            Create New Tool
          </Button>
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          icon={<Eye className="h-5 w-5" />}
          title="Total Views"
          value={dashboardStats.views.total}
          trend={`${dashboardStats.views.trend > 0 ? '+' : ''}${dashboardStats.views.trend}%`}
          trendUp={dashboardStats.views.trend >= 0}
          description="Lifetime views of your tools"
        />
        
        <StatsCard
          icon={<Heart className="h-5 w-5" />}
          title="Total Likes"
          value={dashboardStats.likes.total}
          trend={`${dashboardStats.likes.trend > 0 ? '+' : ''}${dashboardStats.likes.trend}%`}
          trendUp={dashboardStats.likes.trend >= 0}
          description="Likes across all your tools"
        />
        
        <StatsCard
          icon={<LinkIcon className="h-5 w-5" />}
          title="Total Shares"
          value={dashboardStats.shares.total}
          trend={`${dashboardStats.shares.trend > 0 ? '+' : ''}${dashboardStats.shares.trend}%`}
          trendUp={dashboardStats.shares.trend >= 0}
          description="Times your tools were shared"
        />
      </div>
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Quick actions */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="p-1">
              <QuickActionButton 
                icon={<BadgePlus className="h-4 w-4" />}
                label="Create New Tool"
                onClick={handleNewToolClick}
              />
              <QuickActionButton 
                icon={<Layers className="h-4 w-4" />}
                label="Manage Tools"
                href="/dashboard/tools"
              />
              <QuickActionButton 
                icon={<Star className="h-4 w-4" />}
                label="View Favorites"
                href="/dashboard/favorites"
              />
              <QuickActionButton 
                icon={<User className="h-4 w-4" />}
                label="Edit Profile"
                href="/profile"
              />
            </div>
          </div>
          
          {/* Usage tips card */}
          <div className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Tips & Resources</h2>
            </div>
            <div className="p-4 space-y-3">
              <Tip
                icon={<Globe className="h-3.5 w-3.5" />}
                title="Optimize your listings"
                description="Add high-quality images and detailed descriptions to make your tools stand out."
              />
              <Tip
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                title="Engage with the community"
                description="Like and comment on other tools to increase your visibility."
              />
              <Tip
                icon={<RefreshCw className="h-3.5 w-3.5" />}
                title="Keep your tools updated"
                description="Regular updates show that your tools are maintained and reliable."
              />
              <Tip
                icon={<ArrowUp className="h-3.5 w-3.5" />}
                title="Boost discoverability with tags"
                description="Add relevant tags to help users find your tools more easily."
              />
            </div>
          </div>
        </div>
        
        {/* Middle column: Your tools */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your Tools</h2>
              <Link href="/dashboard/tools">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="p-4">
              {userTools.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {userTools.slice(0, 3).map((tool) => (
                    <ToolCard key={tool._id} tool={tool} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-4">
                  <Shapes className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No tools yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start creating and sharing your tools with the community.
                  </p>
                  <Button onClick={handleNewToolClick}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Tool
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent activity */}
          <div className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Link href="/dashboard/activity">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="p-4">
              <ActivityFeed activities={dashboardStats.activities} />
            </div>
          </div>
        </div>
        
        {/* Right column: Favorites and trending */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Favorites</h2>
              <Link href="/dashboard/favorites">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="p-4">
              {favorites.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {favorites.slice(0, 3).map((tool) => (
                    <ToolCard key={tool._id} tool={tool} isFavorite />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-4">
                  <BookMarked className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Explore tools and save your favorites for quick access.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/explore">
                      Explore Tools
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Trending on Builder Central */}
          <div className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm relative">
            <div className="absolute top-0 right-0 mt-2 mr-2 px-2 py-0.5 bg-primary/10 text-xs font-medium rounded-full text-primary">
              Popular
            </div>
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Trending Tools</h2>
            </div>
            <div className="p-4">
              <TrendingTools trendingTools={dashboardStats.trendingTools} />
            </div>
          </div>
        </div>
      </div>
      
      {/* New Tool Modal */}
      <NewToolModal 
        isOpen={showNewToolModal} 
        onClose={handleModalClose} 
      />
    </div>
  );
}

// Stats Card Component
function StatsCard({ icon, title, value, trend, trendUp, description }: { 
  icon: React.ReactNode, 
  title: string, 
  value: number,
  trend: string,
  trendUp: boolean,
  description: string
}) {
  // Determine if data is loaded based on value being greater than zero or trend not being 0
  const isLoaded = value > 0 || trend !== "0%";
  
  return (
    <div className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-md transition-all duration-300 p-5 relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mt-6 -mr-6 blur-2xl"></div>
      <div className="flex items-center justify-between mb-3">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          {icon}
        </div>
        {isLoaded ? (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trendUp ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
          )}>
            {trend}
          </div>
        ) : (
          <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-500">
            --
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ icon, label, onClick, href }: { 
  icon: React.ReactNode, 
  label: string, 
  onClick?: () => void,
  href?: string 
}) {
  const content = (
    <button 
      onClick={onClick} 
      className="w-full flex items-center px-4 py-2.5 hover:bg-primary/5 rounded-lg transition-colors group"
    >
      <div className="w-7 h-7 mr-3 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
  
  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  
  return content;
}

// Tip Component
function Tip({ icon, title, description }: { 
  icon: React.ReactNode,
  title: string, 
  description: string 
}) {
  return (
    <div className="space-y-1 p-2.5 rounded-lg hover:bg-primary/5 transition-colors">
      <h3 className="font-medium text-sm flex items-center">
        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
          {icon}
        </span>
        {title}
      </h3>
      <p className="text-xs text-muted-foreground pl-7">{description}</p>
    </div>
  );
}

// Tool Card Component
function ToolCard({ tool, isFavorite = false }: { 
  tool: Tool, 
  isFavorite?: boolean 
}) {
  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
      <Link href={`/tools/${tool._id}`} className="block">
        {/* Image section */}
        <div className="aspect-video relative overflow-hidden">
          <img
            src={tool.image || "/placeholder-tool.png"}
            alt={tool.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Tag overlay */}
          <div className="absolute top-2 right-2 z-10">
            {tool.tags[0] && (
              <span className="text-[10px] bg-black/70 text-white px-2 py-0.5 rounded-full font-medium">
                {tool.tags[0]}
              </span>
            )}
          </div>
          
          {/* Likes pill */}
          <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/70 text-white rounded-full text-xs px-2 py-0.5">
            <Heart className="h-3 w-3 text-red-400" />
            <span>{tool.loves?.length || 0}</span>
          </div>
          
          {/* Views pill */}
          <div className="absolute bottom-2 right-2 flex items-center space-x-1 bg-black/70 text-white rounded-full text-xs px-2 py-0.5">
            <Eye className="h-3 w-3 text-blue-400" />
            <span>{tool.views || 0}</span>
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {tool.name}
          </h3>
          
          <p className="text-xs text-muted-foreground line-clamp-2 h-8 mt-1">
            {tool.shortDescription}
          </p>
          
          <div className="flex items-center mt-2">
            <span className="text-[10px] text-muted-foreground">
              Created {new Date(tool.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Link>
      
      {/* Action buttons at the bottom */}
      <div className="border-t border-border/50 p-2 flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={tool.author?.avatar || "/default-avatar.png"}
            alt={tool.author?.name}
            className="w-5 h-5 rounded-full border border-border/50"
          />
        </div>
        
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Get the URL from the tool
              let url = tool.deployedUrl;
              
              // Only add the protocol if the URL is completely missing it and it's necessary for navigation
              if (url && !url.match(/^[a-zA-Z]+:\/\//)) {
                // Check if the URL already starts with a domain-like pattern
                if (url.match(/^www\./i) || url.includes('.')) {
                  // Only add https:// for domain-like URLs
                  url = 'https://' + url;
                }
              }
              
              // Open in a new tab
              if (url) {
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="sr-only">Visit</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={(e) => {
              // Prevent event from propagating to the Link component
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-3.5 w-3.5" />
            <span className="sr-only">Like</span>
          </Button>
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
      case 'like': return <Heart className="h-3.5 w-3.5 text-red-500" />;
      case 'view': return <Eye className="h-3.5 w-3.5 text-blue-500" />;
      case 'favorite': return <Star className="h-3.5 w-3.5 text-amber-500" />;
      case 'share': return <LinkIcon className="h-3.5 w-3.5 text-green-500" />;
      case 'comment': return <MessageSquare className="h-3.5 w-3.5 text-purple-500" />;
      case 'update': return <RefreshCw className="h-3.5 w-3.5 text-cyan-500" />;
      default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };
  
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    );
  }
  
  // Only show the first 5 activities with scrolling
  const displayActivities = activities.slice(0, 5);
  
  return (
    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
      {displayActivities.map((activity) => (
        <div key={activity.id} className="p-3 rounded-lg hover:bg-muted transition-colors">
          <div className="flex items-start">
            <div className="mt-0.5 mr-2 p-1.5 rounded-full bg-primary/5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              {activity.toolId && activity.toolName && (
                <Link 
                  href={`/tools/${activity.toolId}`}
                  className="text-xs text-primary hover:underline inline-flex items-center mt-1"
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

// Trending Tools Component
function TrendingTools({ trendingTools }: { trendingTools: TrendingTool[] }) {
  if (!trendingTools || trendingTools.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No trending tools available</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {trendingTools.map((tool) => (
        <div key={tool.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-medium text-sm">{tool.name}</h3>
              <span className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                tool.trend > 0 ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
              )}>
                {tool.trend > 0 ? `+${tool.trend}%` : `${tool.trend}%`}
              </span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Globe className="h-3 w-3 mr-1" />
              {tool.category}
            </div>
          </div>
          <div className="text-sm flex flex-col items-end gap-1 text-muted-foreground">
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {tool.views.toLocaleString()}
            </div>
            <div className="flex items-center">
              <Heart className="h-3 w-3 mr-1 text-red-500" />
              {tool.likes.toLocaleString()}
            </div>
          </div>
        </div>
      ))}
      
      <div className="pt-2">
        <Link href="/explore" className="text-primary text-sm hover:underline inline-flex items-center">
          Explore all trending tools
          <ExternalLink className="h-3 w-3 ml-1" />
        </Link>
      </div>
    </div>
  );
} 