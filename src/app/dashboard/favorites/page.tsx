'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import ToolCard from '@/components/ToolCard';

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

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !token) {
      router.replace('/login?from=/dashboard/favorites');
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/user/favorites', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch your favorites');
        }

        const data = await response.json();
        setFavorites(data.favorites || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, token, router]);

  const handleToggleFavorite = (toolId: string) => {
    // Remove from favorites and update state
    setFavorites((prevFavorites) => 
      prevFavorites.filter((tool) => tool._id !== toolId)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading your favorites...</div>
      </div>
    );
  }

  if (!user) {
    return null; // This should not render as the useEffect will redirect
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Favorites</h1>
        <Link href="/explore">
          <Button>Explore More Tools</Button>
        </Link>
      </div>

      {error ? (
        <div className="text-red-500">{error}</div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            You haven't saved any favorites yet. Explore tools and save ones you like!
          </p>
          <div className="mt-4">
            <Link href="/explore">
              <Button>Explore Tools</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((tool) => (
            <ToolCard
              key={tool._id}
              tool={tool}
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
} 