'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NewToolModal from '@/components/NewToolModal';
import ToolCard from '@/components/ToolCard';

interface Tool {
  _id: string;
  name: string;
  shortDescription: string;
  image: string;
  deployedUrl: string;
  tags: string[];
  createdAt: string;
  author: {
    name: string;
    email: string;
    avatar: string;
  };
}

export default function UserToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewToolModal, setShowNewToolModal] = useState(false);
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !token) {
      router.replace('/login?from=/dashboard/tools');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user's tools
        const toolsResponse = await fetch('/api/tools/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!toolsResponse.ok) {
          throw new Error('Failed to fetch your tools');
        }

        const toolsData = await toolsResponse.json();
        setTools(toolsData.tools || []);
        
        // Fetch user's favorites to check which tools are liked
        const favResponse = await fetch('/api/user/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (favResponse.ok) {
          const favData = await favResponse.json();
          setFavorites(favData.favorites.map((fav: any) => fav._id));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token, router]);

  const handleDeleteTool = async (toolId: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete tool');
      }

      // Remove tool from state
      setTools((prevTools) => prevTools.filter((tool) => tool._id !== toolId));
    } catch (error: unknown) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to delete tool'}`);
    }
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading your tools...</div>
      </div>
    );
  }

  if (!user) {
    return null; // This should not render as the useEffect will redirect
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Tools</h1>
        <Button onClick={() => setShowNewToolModal(true)}>Add New Tool</Button>
      </div>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : tools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            You haven't shared any tools yet. Share your first tool with the community!
          </p>
          <div className="mt-4">
            <Button onClick={() => setShowNewToolModal(true)}>Create Your First Tool</Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool._id} className="relative">
              <ToolCard
                tool={tool}
                isFavorite={favorites.includes(tool._id)}
                onToggleFavorite={handleToggleFavorite}
                showAuthor={false}
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Link href={`/tools/${tool._id}/edit`}>
                  <Button size="sm" variant="secondary" className="p-1 h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="p-1 h-8 w-8 bg-red-100 hover:bg-red-200 text-red-600"
                  onClick={() => handleDeleteTool(tool._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Tool Modal */}
      <NewToolModal 
        isOpen={showNewToolModal} 
        onClose={() => setShowNewToolModal(false)} 
      />
    </div>
  );
} 