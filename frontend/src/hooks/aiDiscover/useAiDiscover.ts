import { useMutation } from "@tanstack/react-query";
import { postAiDiscover } from "../../api/aiDiscover.api";
import type { AiDiscoverResponse } from "../../types/aiDiscover";
import type { AxiosError } from "axios";

export function useAiDiscover() {
  return useMutation<AiDiscoverResponse, AxiosError, string>({
    mutationFn: (query: string) => postAiDiscover({ query }),
  });
}
