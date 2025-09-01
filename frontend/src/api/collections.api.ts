import { api } from "../api/http/axios";
import type { Paged } from "../types/common";
import type { Collection } from "../types/tmdb";

// GET /api/movies/search/collection?q=star%20wars&page=1&language=en-US&includeAdult=false
export async function searchCollections(
  q: string,
  page = 1,
  language = "en-US",
  includeAdult = false
) {
  const { data } = await api.get<Paged<Collection>>(
    "api/Movies/search/collection",
    {
      params: { q, page, language, includeAdult },
    }
  );
  return data;
}
// Prefer this route since it's typed as int on the backend
// GET /api/movies/collection/{id:int}?language=en-US
export async function getCollectionById(id: number, language = "en-US") {
  const { data } = await api.get<Collection>(`api/Movies/collection/${id}`, {
    params: { language },
  });
  return data;
}
