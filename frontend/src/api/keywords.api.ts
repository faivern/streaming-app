import { api } from "./http/axios";
import type { Keyword, MediaType } from "../types/tmdb";

export async function getKeywords(
    mediaType: MediaType,
    mediaId: number
): Promise<Keyword[]> {
    const endpoint = `/api/Movies/${mediaType}/${mediaId}/keywords`;

  const { data } = await api.get<{ keywords?: Keyword[]; results?: Keyword[] }>(endpoint);
  return data.keywords ?? data.results ?? [];
}
