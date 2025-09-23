import MediaCard from "../cards/MediaCard";
import MediaCardSkeleton from "../skeleton/MediaCardSkeleton";
import TitleMid from "../title/TitleMid";
import type { MediaGridItem } from "../../../api/media.api";
import type { MediaType } from "../../../types/tmdb";
interface MediaGridProps {
  media_type: MediaType;
  items: MediaGridItem[];
  loading?: boolean;
  error?: string | null;
  title?: string;
}

export default function MediaGrid({
  media_type,
  items,
  loading = false,
  error = null,
  title,
}: MediaGridProps) {
  const displayTitle = 
    title || `Trending ${media_type === "movie" ? "Movies" : "TV Shows"}`;
  const skeletonCount = 10;

  // Error state
  if (error) {
    return (
      <div className="md:mx-8 px-4 sm:px-6 lg:px-8">
        <TitleMid>{displayTitle}</TitleMid>
        <div className="text-red-400 text-center py-8 bg-red-500/10 rounded-lg border border-red-500/20">
          <p className="text-lg font-medium">Failed to load media</p>
          <p className="text-sm mt-1 opacity-75">{error}</p>
        </div>
      </div>
    );
  }

  return (

    <div className="md:mx-8 px-4 sm:px-6 lg:px-8">
      <TitleMid>{displayTitle}</TitleMid>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-8 justify-items-center">
        {loading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))
          : items.map((item) => (
              <MediaCard
                key={item.id}
                id={item.id}
                title={item.title || item.name || "No title"}
                posterPath={item.poster_path || ""}
                overview={item.overview}
                releaseDate={item.release_date || item.first_air_date || "N/A"}
                vote_average={item.vote_average}
                genre_ids={item.genre_ids || []}
                vote_count={item.vote_count}
                original_language={item.original_language || "en"}
                runtime={item.runtime}
                media_type={media_type}
                number_of_seasons={item.number_of_seasons}
                number_of_episodes={item.number_of_episodes}
              />
            ))}
      </div>
    </div>
  );
}
