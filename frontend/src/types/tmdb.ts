// TODO TMDB/ASP.NET response models

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
    title: string;
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

export type Collection = {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    parts: DetailMedia[];
}

export type TrendingMedia = {
    id: number;
    title?: string;
    name?: string;
    backdrop_path?: string | null;
    media_type?: "movie" | "tv" | "person";
    vote_average?: number;
    overview?: string;
    release_date?: string;
    first_air_date?: string;
    genre_ids?: number[];
}

export type LogoImage = {
    file_path: string;
    iso_639_1?: string | null;
}
export type LogoImagesResponse = {
    logos: LogoImage[];
}

export type DiscoverMedia = {
    total_results: number;
}