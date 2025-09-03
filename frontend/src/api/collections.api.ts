import { api } from "./http/axios";
import type { Paged } from "../types/common";
import type { Collection } from "../types/tmdb";

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

export async function getCollectionById(id: number, language = "en-US") {
  const { data } = await api.get<Collection>(`api/Movies/collection/${id}`, {
    params: { language },
  });
  return data;
}
