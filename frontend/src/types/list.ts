export type ListItem = {
  id: number;
  listId: number;
  tmdbId: number;
  mediaType: string;
  title: string | null;
  posterPath: string | null;
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
