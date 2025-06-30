// src/components/MediaGrid.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import MediaCard from "./MediaCard";

type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
};

type MediaGridProps = {
  type: "movie" | "tv";
};

export default function MediaGrid({ type }: MediaGridProps) {
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/Movies/popularMovie`
      )
      .then((res) => setItems(res.data.results))
      .catch((err) => console.error("Error fetching popular media:", err));
  }, [type]);

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {items.map((item) => (
        <MediaCard
          key={item.id}
          id={item.id}
          title={item.title || item.name || "No title"}
          posterPath={item.poster_path}
          overview={item.overview}
          releaseDate={item.release_date || item.first_air_date || "N/A"}
          vote_average={item.vote_average}
        />
      ))}
    </div>
  );
}
