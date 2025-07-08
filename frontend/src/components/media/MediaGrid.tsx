import { useEffect, useState } from "react";
import axios from "axios";
import MediaCard from "./MediaCard";

export type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genre_ids?: number[];
  original_language?: string;
  vote_count?: number;
  runtime?: number;
  media_type?: string; // Optional prop to specify media type
};


export default function MediaGrid({ media_type }: { media_type: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [detailsCache, setDetailsCache] = useState<{ [id: number]: number }>({});

  useEffect(() => {
    const fetchPopularAndDetails = async () => {
      try {
          const endpoint =
            media_type === "movie"
              ? "/api/Movies/trending/movie/week" // trending or popular ? 
              : "/api/Movies/trending/tv/week";

          const res = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`);

        const mediaList: MediaItem[] = res.data.results;
        setItems(mediaList);

        // Fetch runtime/episode duration per item
        await Promise.all(
          mediaList.map(async (item) => {
            if (!item.id || detailsCache[item.id] !== undefined) return;

            const endpoint =
              media_type === "movie"
                ? `/api/Movies/movie/${item.id}`
                : `/api/Movies/tv/${item.id}`;

            try {
              const detailRes = await axios.get(
                `${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`
              );

              const runtime =
                media_type === "movie"
                  ? detailRes.data.runtime
                  : detailRes.data.episode_run_time?.[0] ?? 0;

              setDetailsCache((prev) => ({
                ...prev,
                [item.id]: runtime,
              }));
            } catch (err) {
              console.error(`Details fetch failed for id ${item.id}`, err);
            }
          })
        );
      } catch (err) {
        console.error("Failed to fetch popular media:", err);
      }
    };

    fetchPopularAndDetails();
  }, [media_type]);

  return (
    <div className="md:mx-8 px-8">
      <h2 className="inline-block text-2xl font-bold mb-4 text-gray-100 hover:text-blue-300 transition-colors duration-300 cursor-pointer">
        Trending {media_type === "movie" ? "Movies" : "TV Shows"}
      </h2>
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
            genre_ids={item.genre_ids || []}
            vote_count={item.vote_count}
            original_language={item.original_language || "en"}
            runtime={detailsCache[item.id] || 0}
            media_type={media_type} // Pass media_type prop
          />
        ))}
      </div>
    </div>
  );
}
