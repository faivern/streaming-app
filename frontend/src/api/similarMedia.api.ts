import { api } from "./http/axios";
import type { MediaType, DetailMedia} from "../types/tmdb";
import type { Paged } from "../types/common";

export async function getSimilarMedia(
    mediaType: MediaType,
    mediaId: number
): Promise<DetailMedia[]> {
    const endpoint = `api/Movies/${mediaType}/${mediaId}/similar`;
    const response = await api.get<Paged<DetailMedia>>(endpoint);
    return response.data.results;
}