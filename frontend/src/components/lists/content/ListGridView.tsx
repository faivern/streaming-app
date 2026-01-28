import MediaCard from "../../media/cards/MediaCard";
import type { DisplayItem } from "../../../types/lists.view";
import type { MediaType } from "../../../types/tmdb";

type ListGridViewProps = {
  items: DisplayItem[];
};

export default function ListGridView({ items }: ListGridViewProps) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {items.map((item) => (
        <MediaCard
          key={`${item.source}-${item.id}`}
          id={item.tmdbId}
          title={item.title}
          posterPath={item.posterPath || ""}
          overview={item.overview || undefined}
          vote_average={item.voteAverage ?? undefined}
          media_type={item.mediaType as MediaType}
        />
      ))}
    </div>
  );
}
