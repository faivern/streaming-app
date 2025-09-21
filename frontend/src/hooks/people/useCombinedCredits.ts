import { useQuery } from "@tanstack/react-query";
import { getCombinedCredits } from "../../api/person.api";
import type { CreditsResponse } from "../../types/tmdb";

export function useCombinedCredits(personId?: number) {
  return useQuery<CreditsResponse>({
    queryKey: ["person", personId, "combined_credits"],
    queryFn: () => getCombinedCredits(personId!),
    enabled: Boolean(personId),
    staleTime: 5 * 60 * 1000,
  });
}