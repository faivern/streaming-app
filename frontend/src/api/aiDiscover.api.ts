import api from "./http/axios";
import type { AiDiscoverRequest, AiDiscoverResponse } from "../types/aiDiscover";

export async function postAiDiscover(
  request: AiDiscoverRequest
): Promise<AiDiscoverResponse> {
  const { data } = await api.post<AiDiscoverResponse>(
    "/api/ai-discover",
    request
  );
  return data;
}
