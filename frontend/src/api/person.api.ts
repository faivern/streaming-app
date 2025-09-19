import { api } from "./http/axios";
import type { Person, CreditsResponse, DetailMedia, MediaType } from "../types/tmdb";

export async function getPersonDetails(personId: number): Promise<Person> {
  const endpoint = `api/Movies/People/${personId}`;
  const { data } = await api.get<Person>(endpoint);
  return data;
}

export async function getCombinedCredits(
  personId: number
): Promise<CreditsResponse> {
  const endpoint = `api/Movies/People/${personId}/combined_credits`;
  const { data } = await api.get<CreditsResponse>(endpoint);
  return {
    cast: data.cast ?? [],
    crew: data.crew ?? [],
  };
}

export async function getEnrichedCredits(
  personId: number,
  mediaType: MediaType
): Promise<CreditsResponse> {
    const endpoint = `api/Movies/${mediaType}/${personId}`;
    const { data } = await api.get<CreditsResponse>(endpoint);
    return {
      cast: data.cast ?? [],
      crew: data.crew ?? [],
    };
  }
