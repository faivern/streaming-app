import { useQuery } from "@tanstack/react-query";
import { getDiscoverMovies, getDiscoverTv} from "../../api/discover.api";
import type { DiscoverMedia } from "../../types/tmdb";

export function useDiscoverMovies() {
  return useQuery<DiscoverMedia, Error>({
    queryKey: ["discover", "movies"],
    queryFn: getDiscoverMovies,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDiscoverTv() {
  return useQuery<DiscoverMedia, Error>({
    queryKey: ["discover", "tv"],
    queryFn: getDiscoverTv,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}