import { useQuery } from "@tanstack/react-query";
import { getEnrichedCredits } from "../../api/person.api";
import type { CreditsResponse, MediaType } from "../../types/tmdb";

export function useEnrichedCredits(id?: number, mediaType?: MediaType) {
  return useQuery<CreditsResponse>({
    queryKey: ["person", id, "enriched_credits", mediaType],
    queryFn: () => getEnrichedCredits(id!, mediaType!),
    enabled: Boolean(id && mediaType),
    staleTime: 5 * 60 * 1000,
  });
}
