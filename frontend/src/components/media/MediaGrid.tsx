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
  media_type?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
};

type DetailsCache = {
  [id: number]: {
    runtime?: number;
    number_of_seasons?: number;
    number_of_episodes?: number;
  };
};

export default function MediaGrid({ media_type }: { media_type: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [detailsCache, setDetailsCache] = useState<DetailsCache>({});

  useEffect(() => {
    const fetchPopularAndDetails = async () => {
      try {
        const endpoint =
          media_type === "movie"
            ? "/api/Movies/trending/movie/day"
            : "/api/Movies/trending/tv/day";

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`
        );

        const mediaList: MediaItem[] = res.data.results;
        setItems(mediaList);

        await Promise.all(
          mediaList.map(async (item) => {
            if (!item.id || detailsCache[item.id]) return;

            const detailEndpoint =
              media_type === "movie"
                ? `/api/Movies/movie/${item.id}`
                : `/api/Movies/tv/${item.id}`;

            try {
              const detailRes = await axios.get(
                `${import.meta.env.VITE_BACKEND_API_URL}${detailEndpoint}`
              );

              if (media_type === "movie") {
                setDetailsCache((prev) => ({
                  ...prev,
                  [item.id]: {
                    runtime: detailRes.data.runtime ?? 0,
                  },
                }));
              } else {
                setDetailsCache((prev) => ({
                  ...prev,
                  [item.id]: {
                    number_of_seasons: detailRes.data.number_of_seasons ?? 0,
                    number_of_episodes: detailRes.data.number_of_episodes ?? 0,
                  },
                }));
              }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media_type]);

return (
  <div className="md:mx-8 px-4 sm:px-6 lg:px-8">

    <h2 className="inline-block mb-4 text-gray-100">
      <span className="underline-hover">
      Trending {media_type === "movie" ? "Movies" : "TV Shows"}
      <span className="underline-bar"></span>
      </span>
    </h2>

    <div
      className="
        grid
        gap-6
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        xl:grid-cols-5
        2xl:grid-cols-6
        justify-items-center
      "
    >
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
          runtime={detailsCache[item.id]?.runtime ?? 0}
          media_type={media_type}
          number_of_seasons={detailsCache[item.id]?.number_of_seasons}
          number_of_episodes={detailsCache[item.id]?.number_of_episodes}
        />
      ))}
    </div>
  </div>
);

}
