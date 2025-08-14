import React from "react";
import MediaCard from "../cards/MediaCard";

type Part = {
  id: number;
  title?: string;
  poster_path?: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  original_language?: string;
  runtime?: number;
};

type Props = {
  parts: Part[];
};

const CollectionGrid = ({ parts }: Props) => {
  if (!parts?.length) {
    return (
      <div className="text-gray-400 text-center py-8">
        No items in this collection.
      </div>
    );
  }

  return (
    <div
      className="
        grid gap-6
        grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6
        justify-items-center
      "
    >
      {parts.map((item) => (
        <MediaCard
          key={item.id}
          id={item.id}
          title={item.title || "Untitled"}
          posterPath={item.poster_path || ""}
          overview={item.overview}
          releaseDate={item.release_date || "N/A"}
          vote_average={item.vote_average}
          genre_ids={item.genre_ids || []}
          vote_count={item.vote_count}
          original_language={item.original_language || "en"}
          runtime={item.runtime}
          media_type="movie"
        />
      ))}
    </div>
  );
};

export default CollectionGrid;
