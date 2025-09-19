import { useQuery } from "@tanstack/react-query";
import { getMediaCredits } from "../../api/credit.api";
import type { Credit, CreditsResponse, MediaType } from "../../types/tmdb";

export function useMediaCredits(mediaType?: MediaType, id?: number) {
  return useQuery<CreditsResponse>({
    queryKey: ["media", "credits", mediaType, id],
    queryFn: () => getMediaCredits(mediaType!, id!),
    enabled: Boolean(mediaType && id),
    staleTime: 5 * 60 * 1000,
  });
}

