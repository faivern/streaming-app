import { api } from "../api/http/axios";
import type { DiscoverMedia } from "../types/tmdb";

export async function getDiscoverMovies() {
    const { data } = await api.get("/api/Movies/discover/movie");
    return data as DiscoverMedia;
}

export async function getDiscoverTv() {
    const { data } = await api.get("/api/Movies/discover/tv");
    return data as DiscoverMedia;
}