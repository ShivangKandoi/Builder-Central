'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { Modal } from '@/components/ui/modal';
import { useRouter } from 'next/navigation';

interface NewToolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewToolModal({ isOpen, onClose }: NewToolModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    deployedUrl: '',
    repositoryUrl: '',
    image: '',
    tags: '',
    technology: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.shortDescription || !formData.description || 
          !formData.deployedUrl || !formData.image) {
        throw new Error('Please fill in all required fields');
      }

      // Format tags as an array
      const tagsArray = formData.tags
        ? formData.tags.split(',').map((tag) => tag.trim())
        : [];

      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creating tool');
      }

      // Reset form and close modal
      setFormData({
        name: '',
        shortDescription: '',
        description: '',
        deployedUrl: '',
        repositoryUrl: '',
        image: '',
        tags: '',
        technology: '',
      });
      
      onClose();
      
      // Navigate to the tool detail page
      router.push(`/tools/${data._id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <div className="py-2">
        <h2 className="text-2xl font-bold mb-6">Share Your Tool</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Tool Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter the name of your tool"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description *</Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="Briefly describe your tool (max 150 characters)"
              maxLength={150}
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be shown on the tool card
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of your tool"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image URL *</Label>
            <Input
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Enter the URL of an image to showcase your tool"
              required
            />
            <p className="text-xs text-muted-foreground">
              This will be the main image displayed on your tool card
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deployedUrl">Application URL *</Label>
            <Input
              id="deployedUrl"
              name="deployedUrl"
              value={formData.deployedUrl}
              onChange={handleChange}
              placeholder="Enter the URL where your tool is deployed"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repositoryUrl">GitHub Repository URL (Optional)</Label>
            <Input
              id="repositoryUrl"
              name="repositoryUrl"
              value={formData.repositoryUrl}
              onChange={handleChange}
              placeholder="Enter the URL to your GitHub repository"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technology">Technology (Optional)</Label>
            <Input
              id="technology"
              name="technology"
              value={formData.technology}
              onChange={handleChange}
              placeholder="Technologies used to build this tool (e.g., React, Node.js)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags separated by commas (e.g., productivity, AI, web app)"
            />
            <p className="text-xs text-muted-foreground">
              Tags help users discover your tool more easily
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Tool...' : 'Create Tool'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 