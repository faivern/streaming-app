import { api } from "./http/axios";
import type { Paged } from "../types/common";
import type { Credit, CreditsResponse, MediaType  } from "../types/tmdb";

export async function getMediaCredits(
    mediaType: MediaType,
    mediaId: number
): Promise<CreditsResponse> {
    const path = 
        mediaType === "movie"
            ? `api/Movies/movie/${mediaId}/credits`
            : `api/Movies/tv/${mediaId}/aggregate_credits`;

    const response = await api.get<CreditsResponse>(path);
    return {
        cast: response.data.cast ?? [],
        crew: response.data.crew ?? [],
    }
}