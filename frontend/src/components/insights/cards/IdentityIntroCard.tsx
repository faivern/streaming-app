import type { TopRatedTitle } from "../../../types/insights";
import type { MediaType } from "../../../types/tmdb";
import MediaCard from "../../media/cards/MediaCard";

type Props = {
  topThree: TopRatedTitle[];
};

export default function IdentityIntroCard({ topThree }: Props) {
  if (topThree.length < 3) return null;

  return (
    <div className="bg-component-primary/40 backdrop-blur-md border border-border/40 rounded-2xl p-8 shadow-xl mb-8">
      <p className="text-xs uppercase tracking-widest text-subtle mb-5">
        Your Top 3 Titles
      </p>
      <div className="grid grid-cols-3 gap-2">
        {topThree.map((item) => (
          <MediaCard
            key={item.tmdbId}
            id={item.tmdbId}
            media_type={item.mediaType as MediaType}
            title={item.title}
            posterPath={item.posterPath ?? ""}
            showQuickAdd={false}
          />
        ))}
      </div>
    </div>
  );
}
