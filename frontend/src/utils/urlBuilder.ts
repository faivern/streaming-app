import { slugify } from "./slugify";
import type { MediaType } from "../types/tmdb";

/** Extract numeric ID from a "123-some-slug" route param. */
export function parseIdSlug(param: string | undefined): number {
  return parseInt(param || "", 10);
}

export function movieUrl(id: number, title: string): string {
  return `/movie/${id}-${slugify(title)}`;
}

export function tvUrl(id: number, title: string): string {
  return `/tv/${id}-${slugify(title)}`;
}

export function mediaUrl(
  mediaType: MediaType | string,
  id: number,
  title: string
): string {
  return mediaType === "tv" ? tvUrl(id, title) : movieUrl(id, title);
}

export function mediaCreditsUrl(
  mediaType: MediaType | string,
  id: number,
  title: string
): string {
  return `${mediaUrl(mediaType, id, title)}/credits`;
}

export function personUrl(id: number, name: string): string {
  return `/person/${id}-${slugify(name)}`;
}

export function genreUrl(
  genreId: number,
  name: string,
  mediaType: MediaType | string = "movie"
): string {
  return `/genre/${genreId}-${slugify(name)}/${mediaType}`;
}

export function providerUrl(providerId: number, name: string): string {
  return `/provider/${providerId}-${slugify(name)}`;
}

export function collectionUrl(collectionId: number, name: string): string {
  return `/collection/${collectionId}-${slugify(name)}`;
}
