import { api } from "./http/axios";
import type { LogoImagesResponse } from "../types/tmdb";

export async function getLogoImages(mediaType: "movie" | "tv", id: number ) {
    const { data } = await api.get<LogoImagesResponse>(`api/Movies/${mediaType}/${id}/images`);
  return data;
}
