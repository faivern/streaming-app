export type ListItem = {
  id: number;
  listId: number;
  tmdbId: number;
  mediaType: string;
  title: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string | null;
  voteAverage: number | null;
  runtime: number | undefined;
  releaseDate: string | undefined;
  firstAirDate: string | undefined;
  numberOfSeasons: number | undefined;
  numberOfEpisodes: number | undefined;
  addedAt: string;
};

export type List = {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  thumbnailPath: string | null;
  createdAt: string;
  updatedAt: string;
  items: ListItem[];
};
