import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API_URL;

export async function searchCollections(
  query: string,
  page = 1,
  language = "en-US",
  includeAdult = false
) {
  const { data } = await axios.get(`${API}/api/Movies/search/collection`, {
    params: { q: query, page, language, includeAdult },
  });
  return typeof data === "string" ? JSON.parse(data) : data;
}

export async function getCollectionById(id: number, language = "en-US") {
  const { data } = await axios.get(`${API}/api/Movies/collection/${id}`, {
    params: { language },
  });
  return typeof data === "string" ? JSON.parse(data) : data;
}
