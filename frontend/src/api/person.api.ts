import { api } from "./http/axios";
import type {
  Person,
  CreditsResponse,
  DetailMedia,
  MediaType,
  Credit,
} from "../types/tmdb";

export async function getPersonDetails(personId: number): Promise<Person> {
  const endpoint = `/api/Movies/Person/${personId}`;
  const { data } = await api.get<Person>(endpoint);
  return data;
}

export async function getCombinedCredits(
  personId: number
): Promise<CreditsResponse> {
  const endpoint = `/api/Movies/person/${personId}/combined_credits`;
  const { data } = await api.get<{
    cast?: Credit[]; // ✅ These are basic credits, not DetailMedia
    crew?: Credit[];
  }>(endpoint);

  return {
    cast: data.cast ?? [],
    crew: data.crew ?? [],
  };
}

export async function getEnrichedCredits(
  personId: number,
  mediaType: MediaType
): Promise<CreditsResponse> {
  const endpoint = `/api/Movies/${mediaType}/${personId}`;
  const { data } = await api.get<CreditsResponse>(endpoint);
  return {
    cast: data.cast ?? [],
    crew: data.crew ?? [],
  };
}

export async function getMediaDetails(
  mediaType: MediaType,
  id: number
): Promise<DetailMedia> {
  const endpoint =
    mediaType === "movie" ? `/api/Movies/movie/${id}` : `/api/Movies/tv/${id}`;
  const { data } = await api.get<DetailMedia>(endpoint);
  return data;
}
