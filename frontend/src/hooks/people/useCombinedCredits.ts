import { useQuery } from "@tanstack/react-query";
import { getCombinedCredits } from "../../api/person.api";
import type { CreditsResponse } from "../../types/tmdb";

export function useCombinedCredits(id?: number) {
  return useQuery<CreditsResponse>({
    queryKey: ["person", id, "combined_credits"],
    queryFn: () => getCombinedCredits(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}