'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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

interface ToolCardProps {
  tool: Tool;
  isFavorite?: boolean;
  onToggleFavorite?: (toolId: string) => void;
  showAuthor?: boolean;
}

export default function ToolCard({ 
  tool, 
  isFavorite = false, 
  onToggleFavorite,
  showAuthor = true 
}: ToolCardProps) {
  const [isLiked, setIsLiked] = useState(isFavorite);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { user, token } = useAuth();
  const router = useRouter();

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !token) {
      router.push(`/login?from=/tools/${tool._id}`);
      return;
    }

    setIsLikeLoading(true);

    try {
      const response = await fetch(`/api/tools/${tool._id}/favorites`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        // Call the parent callback if provided
        if (onToggleFavorite) {
          onToggleFavorite(tool._id);
        }
      } else {
        // Handle errors from the server
        const errorData = await response.json().catch(() => ({ message: 'Failed to toggle favorite' }));
        console.error('Error toggling favorite:', errorData.message);
      }
    } catch (error: unknown) {
      console.error('Error toggling favorite:', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleVisitClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Fix: Ensure the URL has a protocol, defaulting to https if missing
    let url = tool.deployedUrl;
    if (url && !url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    
    // Open in a new tab
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="group relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient border effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300 group-hover:duration-200"></div>
      
      <div className="relative h-full flex flex-col bg-card rounded-xl overflow-hidden transition-all duration-300 shadow-sm group-hover:shadow-lg border border-border/40 group-hover:border-primary/20">
        <Link href={`/tools/${tool._id}`} className="flex flex-col flex-grow">
          {/* Image section */}
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img
              src={tool.image || '/placeholder-tool.png'}
              alt={tool.name}
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Tag overlay */}
            <div className="absolute top-2 right-2 z-20">
              {tool.tags[0] && (
                <span className="text-[10px] bg-black/30 backdrop-blur-md text-white px-2 py-0.5 rounded-full font-medium border border-white/10">
                  {tool.tags[0]}
                </span>
              )}
            </div>
            
            {/* Admin badge (if applicable) */}
            {tool.author?.email === "admin@builder-central.com" && (
              <div className="absolute top-2 left-2 z-30 flex items-center gap-1 bg-primary/70 dark:bg-primary/90 text-white text-xs py-1 px-2 rounded-full backdrop-blur-sm">
                <span className="text-yellow-400">⚡</span>
                Admin
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          {/* Content section */}
          <div className="p-4 flex flex-col flex-grow">
            <div className="mb-1 flex justify-between items-start">
              <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              
              {/* Like button - Moved inside content for better layout */}
              <button
                onClick={handleLikeClick}
                disabled={isLikeLoading}
                className={cn(
                  "flex items-center justify-center p-1.5 rounded-full transition-all duration-200",
                  isLiked 
                    ? "text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
                aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
              >
                {isLikeLoading ? (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart 
                    className={cn(
                      "h-4 w-4 transition-transform", 
                      isLiked ? "fill-current scale-110" : "",
                      isHovered && !isLiked ? "animate-pulse" : ""
                    )} 
                  />
                )}
              </button>
            </div>
            
            {/* Tags pills */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] py-0.5 px-2 rounded-full bg-primary/10 text-primary/80 dark:bg-primary/20 dark:text-primary/90 font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {tool.tags.length > 3 && (
                  <span className="text-[10px] py-0.5 px-2 rounded-full bg-muted/80 text-muted-foreground font-medium">
                    +{tool.tags.length - 3}
                  </span>
                )}
              </div>
            )}
            
            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-grow">
              {tool.shortDescription}
            </p>
            
            {/* Author info */}
            {showAuthor && (
              <div className="flex items-center mt-auto pt-2 border-t border-border/30">
                <img
                  src={tool.author.avatar || "/default-avatar.png"}
                  alt={tool.author.name}
                  className="w-5 h-5 rounded-full border border-border/50 mr-2"
                />
                <span className="text-xs text-muted-foreground truncate">
                  {tool.author.name}
                </span>
              </div>
            )}
          </div>
        </Link>
        
        {/* Bottom action bar */}
        <div className="px-4 pb-4 flex items-center justify-between">
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 px-3 rounded-full text-xs font-normal border-primary/20 text-primary hover:text-primary hover:bg-primary/5"
            onClick={handleVisitClick}
          >
            Visit Site
            <ExternalLink className="ml-1.5 h-3 w-3" />
          </Button>
          
          <Link 
            href={`/tools/${tool._id}`}
            className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            Details
            <ChevronRight className="ml-0.5 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
} 