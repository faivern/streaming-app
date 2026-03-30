import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { postAiDiscover } from "../../api/aiDiscover.api";
import type { AiDiscoverResponse } from "../../types/aiDiscover";
import type { AxiosError } from "axios";

export function useAiDiscover() {
  const abortRef = useRef<AbortController | null>(null);

  return useMutation<AiDiscoverResponse, AxiosError, string>({
    mutationFn: (query: string) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      return postAiDiscover({ query }, abortRef.current.signal);
    },
  });
}
