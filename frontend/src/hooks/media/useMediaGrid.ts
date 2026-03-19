import { useQuery } from "@tanstack/react-query";
import { getTrendingMediaGrid } from "../../api/media.api";
import type { MediaType } from "../../types/tmdb";

export type { MediaGridItem } from "../../api/media.api";
export type { MediaType } from "../../types/tmdb";

export default function useMediaGrid(mediaType: MediaType) {
  return useQuery({
    queryKey: ["mediaGrid", mediaType, "day"],
    queryFn: () => getTrendingMediaGrid(mediaType, "day", [1, 2]),
    staleTime: 5 * 60 * 1000,
  });
}
