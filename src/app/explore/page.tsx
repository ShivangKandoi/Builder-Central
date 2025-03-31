'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import NewToolModal from '@/components/NewToolModal';
import ToolCard from '@/components/ToolCard';
import { Search, Filter, Grid3X3, ListFilter, Plus, Sparkles, Bookmark, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tool {
  _id: string;
  name: string;
  shortDescription: string;
  image: string;
  deployedUrl: string;
  tags: string[];
  author: {
    name: string;
    email: string;
    avatar: string;
  };
}

// Sample tools data for fallback
const SAMPLE_TOOLS: Tool[] = [
  {
    _id: '1',
    name: 'AI Code Assistant',
    shortDescription: 'Generate, explain, and optimize code with advanced AI assistance.',
    image: '/tools/ai-assistant.png',
    deployedUrl: 'https://ai-assistant.example.com',
    tags: ['AI', 'Productivity'],
    author: {
      name: 'Dev Team',
      email: 'team@example.com',
      avatar: '/avatars/team.png'
    }
  },
  {
    _id: '2',
    name: 'Design System Kit',
    shortDescription: 'A comprehensive design system for building beautiful web interfaces.',
    image: '/tools/design-system.png',
    deployedUrl: 'https://design-system.example.com',
    tags: ['UI', 'Design'],
    author: {
      name: 'UI Masters',
      email: 'ui@example.com',
      avatar: '/avatars/ui.png'
    }
  },
  {
    _id: '3',
    name: 'DevOps Automation',
    shortDescription: 'Automate your CI/CD pipeline with this comprehensive toolkit.',
    image: '/tools/devops.png',
    deployedUrl: 'https://devops.example.com',
    tags: ['DevOps', 'Automation'],
    author: {
      name: 'CloudTeam',
      email: 'cloud@example.com',
      avatar: '/avatars/cloud.png'
    }
  }
];

// All possible categories
const CATEGORIES = [
  'All',
  'AI',
  'Productivity',
  'Design',
  'DevOps',
  'Development',
  'Automation'
];

export default function ExplorePage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewToolModal, setShowNewToolModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { user, token } = useAuth();
  const router = useRouter();

  // Filter tools based on search query and category
  const filteredTools = tools.filter(tool => {
    const matchesSearch = 
      searchQuery === '' || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = 
      selectedCategory === 'All' || 
      tool.tags.some(tag => tag === selectedCategory);
      
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch tools with proper error handling
        try {
          const toolsResponse = await fetch('/api/tools', {
            headers,
            cache: 'no-store' // Ensure fresh data
          });
          
          if (!toolsResponse.ok) {
            if (toolsResponse.status === 401) {
              console.warn('Authentication required for full access');
              // Continue with sample data instead of throwing error
            } else {
              throw new Error(`Server error: ${toolsResponse.status}`);
            }
          }
          
          const toolsData = await toolsResponse.json();
          if (toolsData && toolsData.tools && toolsData.tools.length > 0) {
            setTools(toolsData.tools);
          } else {
            console.warn('No tools returned from API, using sample data');
            setTools(SAMPLE_TOOLS);
          }
        } catch (apiError) {
          console.error("Error fetching tools from API:", apiError);
          // Use sample data when API fails
          setTools(SAMPLE_TOOLS);
        }
        
        // If user is authenticated, fetch their favorites
        if (token) {
          try {
            const favResponse = await fetch('/api/user/favorites', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (favResponse.ok) {
              const favData = await favResponse.json();
              setFavorites(favData.favorites?.map((fav: any) => fav._id) || []);
            }
          } catch (favError) {
            console.error("Error fetching favorites:", favError);
            // Continue without favorites
          }
        }
      } catch (err: any) {
        console.error("Error in data fetching process:", err);
        // Always show sample data even on error
        setTools(SAMPLE_TOOLS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleAddNewTool = () => {
    if (!user || !token) {
      router.push('/login?from=/explore');
      return;
    }
    setShowNewToolModal(true);
  };
  
  const handleToggleFavorite = (toolId: string) => {
    // Update local favorites state for immediate UI feedback
    if (favorites.includes(toolId)) {
      setFavorites(favorites.filter(id => id !== toolId));
    } else {
      setFavorites([...favorites, toolId]);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative inline-block">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <div className="mt-4 text-center text-muted-foreground">Loading amazing tools...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="relative bg-gradient-to-br from-background to-muted/30 border-b border-border/30 py-10 -mt-8 mb-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Explore Tools
              <div className="inline-flex ml-2 items-center px-1.5 py-0.5 border border-primary/20 rounded text-sm font-medium bg-primary/5 text-primary">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>{tools.length}</span>
              </div>
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover amazing tools created by the community to supercharge your workflow
            </p>
            
            {/* Search bar */}
            <div className="relative max-w-xl mx-auto mt-6">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Search by name, description, or tag..."
                className="pl-10 pr-4 py-6 rounded-full border-border/40 bg-background/80 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="hidden md:block absolute top-0 right-10 w-80 h-80 bg-primary/5 rounded-full filter blur-3xl opacity-30 -z-10"></div>
        <div className="hidden md:block absolute bottom-0 left-10 w-40 h-40 bg-primary/10 rounded-full filter blur-xl opacity-20 -z-10"></div>
      </section>
      
      <div className="container mx-auto px-4">
        {/* Filters and action bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full transition-colors",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-card hover:bg-muted text-muted-foreground border border-border/40"
                )}
              >
                {category}
              </button>
            ))}
          </div>
          
          <Button 
            onClick={handleAddNewTool}
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-4"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Share Your Tool
          </Button>
        </div>
        
        {/* Results info */}
        {searchQuery || selectedCategory !== 'All' ? (
          <div className="mb-6 text-sm text-muted-foreground">
            Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
            {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
            {selectedCategory !== 'All' && <span> in <Badge variant="outline" className="font-normal ml-1">{selectedCategory}</Badge></span>}
            
            {filteredTools.length === 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="ml-2 text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : null}

        {error && !tools.length ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
            <div className="text-red-500">{error}</div>
            {error === 'Please login to view tools' && (
              <Link href="/login?from=/explore">
                <Button>Login to View Tools</Button>
              </Link>
            )}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4 py-12 my-8 bg-muted/30 rounded-xl border border-border/40">
            <div className="p-4 bg-background rounded-full">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center">
              No tools found with the current filters.
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }} variant="secondary">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool._id}
                tool={tool}
                isFavorite={favorites.includes(tool._id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
        
        {/* User tools promo */}
        {user && token && filteredTools.length > 0 && (
          <div className="mt-16 p-6 bg-card/50 backdrop-blur-sm border border-border/40 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full filter blur-xl opacity-50 -z-10 transform translate-x-10 -translate-y-10"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-semibold">Your Developer Toolkit</h3>
                <p className="text-muted-foreground">Check out tools you've created or saved for later.</p>
              </div>
              
              <div className="flex gap-3">
                <Link href="/dashboard/tools">
                  <Button variant="outline" className="rounded-full">
                    <Grid3X3 className="h-4 w-4 mr-1.5" />
                    My Tools
                  </Button>
                </Link>
                <Link href="/dashboard/favorites">
                  <Button variant="outline" className="rounded-full">
                    <Bookmark className="h-4 w-4 mr-1.5" />
                    Favorites
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Tool Modal */}
      <NewToolModal 
        isOpen={showNewToolModal} 
        onClose={() => setShowNewToolModal(false)} 
      />
    </div>
  );
} 