import { api } from "../api/http/axios";
import type { DiscoverMedia} from "../types/tmdb";

export async function getDiscoverMovies() {
    const { data } = await api.get("/api/discover/movie");
    return data as DiscoverMedia;
}

export async function getDiscoverTv() {
    const { data } = await api.get("/api/discover/tv");
    return data as DiscoverMedia;
}
