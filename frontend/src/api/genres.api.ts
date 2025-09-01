import { api } from "../api/http/axios";
import type { Genre } from "../types/tmdb";

export async function getMovieGenres() {
  const { data } = await api.get<{ genres: Genre[] }>("api/Movies/genre/movie/list");
  return data.genres;
}

export async function getTvGenres() {
  const { data } = await api.get<{ genres: Genre[] }>("api/Movies/genre/tv/list");
  return data.genres;
}