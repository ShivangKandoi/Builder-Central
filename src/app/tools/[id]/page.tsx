'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ExternalLink, Github, Heart, Calendar, Tag, User, Code, ArrowLeft, Share2, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface Tool {
  _id: string;
  name: string;
  shortDescription: string;
  description: string;
  deployedUrl: string;
  repositoryUrl: string;
  image: string;
  technology: string;
  tags: string[];
  author: {
    _id: string;
    name: string;
    email: string;
    avatar: string;
  };
  comments: Comment[];
  createdAt: string;
}

interface Comment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  loves?: string[];
}

export default function ToolDetailPage({ params }: { params: { id: string } }) {
  // Extract the toolId directly from params without using React.use
  const toolId = params.id;
  
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const { user, token } = useAuth();
  const router = useRouter();
  
  // New state variables for comments functionality
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentError, setCommentError] = useState('');
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  useEffect(() => {
    // Only fetch when toolId is available and non-empty
    if (!toolId) return;
    
    const fetchTool = async () => {
      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/tools/${toolId}`, {
          headers,
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Tool not found');
          }
          throw new Error('Failed to fetch tool details');
        }

        const data = await response.json();
        setTool(data);
        
        // Set comments from the tool data if they exist
        if (data.comments && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
        setLoadingComments(false);

        // Check if tool is in user's favorites
        if (token) {
          const favResponse = await fetch('/api/user/favorites', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (favResponse.ok) {
            const favData = await favResponse.json();
            setIsFavorite(
              favData.favorites.some((fav: { _id: string }) => fav._id === toolId)
            );
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching tool details');
        setLoadingComments(false);
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [toolId, token]);

  const toggleFavorite = async () => {
    if (!user || !token) {
      router.push('/login?from=/tools/' + toolId);
      return;
    }

    setIsLikeLoading(true);

    try {
      const response = await fetch(`/api/tools/${toolId}/favorites`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error: unknown) {
      console.error('Error toggling favorite:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Submit a new comment
  const submitComment = async () => {
    if (!user || !token) {
      router.push('/login?from=/tools/' + toolId);
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    
    try {
      const response = await fetch(`/api/tools/${toolId}/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'comment',
          comment: newComment
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const updatedTool = await response.json();
      
      // Update comments list with the new comment
      if (updatedTool.comments && Array.isArray(updatedTool.comments)) {
        setComments(updatedTool.comments);
      }
      
      // Clear the comment input
      setNewComment('');
      
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : 'Error posting comment');
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Format relative time for comments
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Prepare URL for sharing
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/tools/${toolId}` : '';
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tool?.name || 'Check out this tool',
          text: tool?.shortDescription || 'A great tool from Builder Central',
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <div className="mt-6 text-center text-muted-foreground">Loading tool details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="p-4 rounded-full bg-destructive/10">
            <div className="text-destructive">⚠️</div>
          </div>
          <div className="text-xl font-semibold">{error}</div>
          <p className="text-muted-foreground">We couldn't find the tool you're looking for.</p>
          <Link href="/explore">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="container mx-auto py-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="p-4 rounded-full bg-destructive/10">
            <div className="text-destructive">⚠️</div>
          </div>
          <div className="text-xl font-semibold">Tool not found</div>
          <p className="text-muted-foreground">We couldn't find the tool you're looking for.</p>
          <Link href="/explore">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-background via-background/95 to-muted/20 min-h-screen pb-16">
      {/* Back button navigation */}
      <div className="container mx-auto pt-6">
        <Link 
          href="/explore" 
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full border border-border/40 hover:border-border/80 bg-background/80 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Explore
        </Link>
      </div>
      
      {/* Hero section with image background */}
      <div className="relative pt-8 md:pt-12 pb-20">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0 overflow-hidden opacity-10 -z-10">
          <img
            src={tool.image || '/placeholder-tool.png'}
            alt=""
            className="w-full h-full object-cover blur-md"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background"></div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-32 right-0 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl opacity-30 -z-5 animate-pulse" style={{ animationDuration: '15s' }}></div>
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-primary/10 rounded-full filter blur-2xl opacity-20 -z-5 animate-pulse" style={{ animationDuration: '20s' }}></div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            {/* Main content - left side */}
            <div className="lg:col-span-8 space-y-10">
              <div>
                {/* Title only - keeping in the original position */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                  <div className="space-y-4 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                      {tool.name || "Untitled Tool"}
                    </h1>
                  </div>
                </div>
                
                {/* Tags - more visually appealing */}
                {tool.tags && tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {tool.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline"
                        className="bg-primary/20 hover:bg-primary/30 border-primary/30 text-foreground px-3 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm"
                      >
                        <Tag className="h-3.5 w-3.5 mr-1.5 text-primary" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Main image - enhanced display with hover effects and subtle animation */}
              <div className="aspect-video w-full relative rounded-xl overflow-hidden border border-border/50 shadow-lg">
                <img
                  src={tool.image || '/placeholder-tool.png'}
                  alt={tool.name}
                  className="object-cover w-full h-full"
                />
              </div>
              
              {/* MOVED: Short description and action buttons below the image */}
              <div className="space-y-4">
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {tool.shortDescription || "This tool doesn't have a description yet."}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    disabled={isLikeLoading}
                    className={cn(
                      "h-10 w-10",
                      isFavorite 
                        ? "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/30" 
                        : "hover:text-red-500 hover:border-red-200"
                    )}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5",
                        isFavorite ? "fill-current" : "",
                        isLikeLoading ? "opacity-50" : ""
                      )}
                    />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="h-10 w-10 hover:bg-primary/5 hover:border-primary/20"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                  
                  {tool.repositoryUrl && (
                    <Link href={tool.repositoryUrl} target="_blank" rel="noopener noreferrer">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10 hover:bg-primary/5 hover:border-primary/20"
                      >
                        <Github className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  
                  <Link href={tool.deployedUrl || "#"} target="_blank" rel="noopener noreferrer">
                    <Button className="h-10 px-5">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span>Open Tool</span>
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Description section - enhanced with proper typography and spacing */}
              <div className="mt-6 space-y-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="h-6 w-1 bg-primary rounded-full"></div>
                  <h2 className="text-2xl font-semibold">About this tool</h2>
                </div>
                
                <div className="prose prose-lg max-w-none dark:prose-invert prose-a:text-primary prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground">
                  {tool.description ? (
                    tool.description.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph || "No description available."}</p>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic">No detailed description has been provided for this tool.</p>
                  )}
                </div>
              </div>
              
              {/* Functional Reviews/Comments Section */}
              <div className="mt-10 space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-6 w-1 bg-primary rounded-full"></div>
                  <h2 className="text-2xl font-semibold">Reviews</h2>
                </div>
                
                {/* Review Input Form */}
                <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-4">
                  <h3 className="text-base font-medium mb-3">Leave a review</h3>
                  <textarea 
                    className="w-full min-h-[100px] p-3 bg-background rounded-lg border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                    placeholder="Share your thoughts about this tool..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!user || isSubmittingComment}
                  ></textarea>
                  <div className="flex justify-between items-center mt-3">
                    {!user && (
                      <p className="text-sm text-muted-foreground">
                        <Link href={`/login?from=/tools/${toolId}`} className="text-primary hover:underline">
                          Sign in
                        </Link> to leave a review
                      </p>
                    )}
                    {commentError && (
                      <p className="text-sm text-destructive">{commentError}</p>
                    )}
                    <Button 
                      onClick={submitComment} 
                      disabled={!user || isSubmittingComment || !newComment.trim()}
                      className={isSubmittingComment ? "opacity-70" : ""}
                    >
                      {isSubmittingComment ? "Posting..." : "Post Review"}
                    </Button>
                  </div>
                </div>
                
                {/* Comments List */}
                <div className="space-y-4 mt-6">
                  {loadingComments ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  ) : comments.length > 0 ? (
                    <>
                      {comments.map((comment) => (
                        <div key={comment._id} className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden border border-border/50">
                                <img 
                                  src={comment.userId?.avatar || '/default-avatar.png'} 
                                  alt={comment.userId?.name || "User"} 
                                  className="h-full w-full object-cover" 
                                />
                              </div>
                              <div>
                                <h4 className="font-medium">{comment.userId?.name || "Anonymous User"}</h4>
                                <p className="text-xs text-muted-foreground">{formatRelativeTime(comment.createdAt)}</p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                if (!user) {
                                  router.push(`/login?from=/tools/${toolId}`);
                                  return;
                                }
                                // Like functionality would go here
                              }}
                            >
                              <Heart className={cn(
                                "h-4 w-4 mr-1",
                                user?.id && comment.loves?.includes(user.id) ? "fill-red-500 text-red-500" : ""
                              )} /> 
                              {comment.loves?.length || 0}
                            </Button>
                          </div>
                          <p className="mt-3 text-sm">{comment.content}</p>
                        </div>
                      ))}
                      
                      {/* Load More Button */}
                      {hasMoreComments && (
                        <div className="flex justify-center mt-4">
                          <Button 
                            variant="outline" 
                            className="w-full max-w-xs"
                            onClick={() => {
                              setCommentsPage(prev => prev + 1);
                              // Implement pagination logic here if needed
                            }}
                          >
                            Load More Reviews
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sidebar - right side (enhanced with better visuals and organization) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Tool info card - more visually appealing */}
              <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:border-border/80">
                <div className="p-6 space-y-6">
                  {/* Author info - more prominent */}
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary/20 ring-2 ring-background shadow-md">
                      <img
                        src={tool.author?.avatar || '/default-avatar.png'}
                        alt={tool.author?.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created by</p>
                      <p className="font-semibold text-foreground flex items-center">
                        {tool.author?.name || "Unknown creator"}
                        {tool.author?.email === "admin@builder-central.com" && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <hr className="border-border/40" />
                  
                  {/* Tool metadata - more engaging visuals */}
                  <div className="space-y-4">
                    {/* Created date */}
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2.5 rounded-md text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created on</p>
                        <p className="text-sm font-medium">{formatDate(tool.createdAt || new Date().toISOString())}</p>
                      </div>
                    </div>
                    
                    {/* Technology */}
                    {tool.technology && (
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2.5 rounded-md text-primary">
                          <Code className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Technology</p>
                          <p className="text-sm font-medium">{tool.technology}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Usage Stats (could be added later) */}
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2.5 rounded-md text-primary">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Popularity</p>
                        <div className="flex items-center mt-0.5">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
                          </div>
                          <span className="text-xs ml-2 text-muted-foreground">65%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* CTA buttons - more aesthetically pleasing */}
                <div className="p-6 bg-muted/40 border-t border-border/30">
                  <Button 
                    className="w-full"
                    onClick={() => {
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
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span>Visit Website</span>
                  </Button>
                  
                  {tool.repositoryUrl && (
                    <Link href={tool.repositoryUrl} target="_blank" rel="noopener noreferrer" className="block mt-3">
                      <Button variant="outline" className="w-full">
                        <Github className="h-4 w-4 mr-2" />
                        View Source
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Share card - more engaging */}
              <div className="bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden p-6 shadow-md">
                <h3 className="font-medium mb-4 flex items-center">
                  <Share2 className="h-4 w-4 mr-2 text-primary" />
                  Share this tool
                </h3>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Know someone who would find this tool useful? Share it with them!
                  </p>
                  <div className="flex items-center p-2 bg-muted/60 rounded-lg border border-border/40 text-xs text-muted-foreground">
                    <span className="truncate flex-1 mr-2">{shareUrl}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 hover:bg-primary/10"
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        alert('Link copied to clipboard!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <Button 
                    variant="outline"
                    className="w-full justify-center mt-2"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Tool
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 