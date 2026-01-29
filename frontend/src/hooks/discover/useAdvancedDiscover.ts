import { useQuery } from "@tanstack/react-query";
import {
  getAdvancedDiscover,
  type AdvancedDiscoverParams,
} from "../../api/advancedDiscover.api";
import type { DetailMedia } from "../../types/tmdb";
import type { Paged } from "../../types/common";

export const advancedDiscoverKeys = {
  all: ["advancedDiscover"] as const,
  filters: (params: AdvancedDiscoverParams) =>
    [...advancedDiscoverKeys.all, params] as const,
};

export function useAdvancedDiscover(
  params: AdvancedDiscoverParams,
  options?: { enabled?: boolean }
) {
  return useQuery<Paged<DetailMedia>, Error>({
    queryKey: advancedDiscoverKeys.filters(params),
    queryFn: () => getAdvancedDiscover(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}
