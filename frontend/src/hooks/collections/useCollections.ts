import { useQuery } from '@tanstack/react-query';
import { searchCollections, getCollectionById } from '../../api/collections.api';
import type { Paged } from '../../types/common';
import type { Collection } from '../../types/tmdb';
import type { FeaturedCollection } from '../../utils/featuredCollections';

export function useSearchCollections(
    q: string,
    page = 1,
    language = "en-US"
) {
    return useQuery<Paged<Collection>>({
        queryKey: ["collections", "search", q, page, language],
        queryFn: () => searchCollections(q, page, language),
        enabled: !!q,
    });
}

export function useCollectionById(id?: number, language = "en-US") {
    return useQuery<Collection>({
        queryKey: ["collections", "id", id, language],
        queryFn: () => (getCollectionById(id!, language)),
        enabled: !!id,
    });
}

export function useFeaturedCollections(
    collections: FeaturedCollection[],
    language = "en-US"
) {
  return useQuery<Collection[]>({
    queryKey: ["collections", "featured", collections.map((c) => c.id), language],
    queryFn: async () => {
      const results = await Promise.all(
        collections.map((c) => getCollectionById(c.id, language))
      );
      return results.filter(Boolean);
    },
    enabled: collections.length > 0,
  });
}
