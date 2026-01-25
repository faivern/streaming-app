// TODO TMDB/ASP.NET response models

export type MediaType = "movie" | "tv";

export type Genre = {
  id: number;
  name: string;
};

export type DetailMediaGenre = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  original_language?: string;
  vote_count?: number;
  runtime?: number;
  media_type?: "movie" | "tv";
  number_of_seasons?: number;
  number_of_episodes?: number;
};

export type DetailMedia = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genres?: { id: number; name: string }[];
  genre_ids?: number[];
  original_language?: string;
  production_countries?: { name: string }[];
  origin_country?: string[];
  production_companies?: {
    id: number;
    name: string;
    logo_path?: string | null;
  }[];
  tagline?: string;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  budget?: number;
  revenue?: number;
  media_type?: MediaType;
  imdb_id?: string;
  external_ids?: {
    imdb_id?: string;
    tvdb_id?: number;
    facebook_id?: string;
    instagram_id?: string;
    twitter_id?: string;
  };
};

export type Collection = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: DetailMedia[];
};

export type TrendingMedia = {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  media_type?: "movie" | "tv" | "person";
  vote_average?: number;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
};

export type LogoImage = {
  file_path: string;
  iso_639_1?: string | null;
};
export type LogoImagesResponse = {
  logos: LogoImage[];
};

export type DiscoverMedia = {
  total_results: number;
};

export type Keyword = {
  id: number;
  name: string;
};

export type Credit = {
  id: number;
  name?: string;
  character?: string;
  job?: string;
  profile_path?: string | null;
  department?: string;
  order?: number;
};

export type CreditsResponse = {
  cast: Credit[];
  crew: Credit[];
};

export type Person = {
  id: number;
  name: string;
  birthday: string;
  biography?: string;
  known_for_department?: string;
  place_of_birth?: string;
  profile_path?: string;
  gender?: number;
  deathday?: string;
};

// types/tmdb.ts
export type EnrichedCreditMedia = DetailMedia & {
  character?: string;
  job?: string;
  department?: string;
  person_id?: number;
};

// Watch Provider Types
export type WatchProvider = {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
};

export type CountryWatchProviders = {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  ads?: WatchProvider[];
};

export type WatchProvidersResponse = {
  id: number;
  results: Record<string, CountryWatchProviders>;
};

export type WatchProviderRegion = {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
};

export type WatchProviderRegionsResponse = {
  results: WatchProviderRegion[];
};
