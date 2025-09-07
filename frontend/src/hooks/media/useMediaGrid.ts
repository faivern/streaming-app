import { useState, useCallback } from 'react';
import { getTrendingMediaWithDetails } from '../../api/media.api';
import type { MediaGridItem, MediaType } from '../../api/media.api';

// Re-export types for convenience
export type { MediaGridItem, MediaType } from '../../api/media.api';

interface UseMediaGridReturn {
  items: MediaGridItem[];
  loading: boolean;
  error: string | null;
  fetchMediaGrid: (mediaType: MediaType) => Promise<void>;
  clearMedia: () => void;
}

export default function useMediaGrid(): UseMediaGridReturn {
  const [items, setItems] = useState<MediaGridItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMediaGrid = useCallback(async (mediaType: MediaType) => {
    try {
      setLoading(true);
      setError(null);
      setItems([]); // Clear items before fetching

      // Use the API function to get trending media with details
      const mediaWithDetails = await getTrendingMediaWithDetails(mediaType);
      setItems(mediaWithDetails);

    } catch (err) {
      console.error('Failed to fetch media grid:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch media');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMedia = useCallback(() => {
    setItems([]);
    setError(null);
  }, []);

  return {
    items,
    loading,
    error,
    fetchMediaGrid,
    clearMedia,
  };
}
