import { api } from "../api/http/axios";
import type { Genre, DetailMedia, MediaType } from "../types/tmdb";
import type { Paged } from "../types/common";

//todo getgenrediscoverbygenreid
export async function getMovieGenres() {
  const { data } = await api.get<{ genres: Genre[] }>(
    "/api/Movies/genre/movie/list"
  );
  return data.genres;
}

export async function getTvGenres() {
  const { data } = await api.get<{ genres: Genre[] }>(
    "/api/Movies/genre/tv/list"
  );
  return data.genres;
}

export async function getDiscoverGenre(params: {
  page?: number;
  mediaType?: MediaType;
  genreId: number;
}): Promise<Paged<DetailMedia>> {
  const endpoint = "/api/Movies/discover/by-genre";
  const { data } = await api.get<Paged<DetailMedia>>(endpoint, { params });
  return data;
}
