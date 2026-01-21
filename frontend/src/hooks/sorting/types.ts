export type SortableMedia = {
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
};

export type SortOption = "bayesian" | "newest" | "oldest" | "a-z" | "z-a";
