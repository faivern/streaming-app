import { useQuery } from '@tanstack/react-query';
import { searchCollections, getCollectionById } from '../../api/collections.api';
import type { Paged } from '../../types/common';
import type { Collection } from '../../types/tmdb';

/*
* Hook for searching collections by query string
*/
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


/*
* Hook for fetching a collection by ID
*/
export function useCollectionById(id?: number, language = "en-US") {
    return useQuery<Collection>({
        queryKey: ["collections", "id", id, language],
        queryFn: () => (getCollectionById(id!, language)),
        enabled: !!id,
    });
}

/*
 * Fetch a small curated set of collections (by name) for the homepage carousel.
 * Returns the top match for each name, in order.
*/
export function useFeaturedCollections(
    names: string[],
    language = "en-US"
) {
  return useQuery<Collection[]>({
    queryKey: ["collections", "featured", names, language],
    queryFn: async () => {
      const pages = await Promise.all(
        names.map((n) => searchCollections(n, 1, language))
      );
      // pick the first result from each page (if any)
      return pages
        .map((p) => p?.results?.[0])
        .filter(Boolean) as Collection[];
    },
    enabled: names.length > 0,
  });
}
