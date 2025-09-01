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