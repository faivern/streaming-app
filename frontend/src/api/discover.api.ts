import { api } from "../api/http/axios";

export async function getDiscoverMovies() {
    const { data } = await api.get("/api/Movies/discover/movie");
    return data;
}

export async function getDiscoverTv() {
    const { data } = await api.get("/api/Movies/discover/tv");
    return data;
}