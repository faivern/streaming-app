import useEmblaCarousel from "embla-carousel-react";
import MediaCard from "../media/cards/MediaCard";
import type { AiDiscoverResult } from "../../types/aiDiscover";

type AiResultsGridProps = {
  results: AiDiscoverResult[];
};

export default function AiResultsGrid({ results }: AiResultsGridProps) {
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: false,
  });

  return (
    <>
      {/* Mobile: Embla horizontal scroll */}
      <div className="lg:hidden overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6">
          {results.map((r) => (
            <div key={`${r.mediaType}-${r.tmdbId}`} className="flex-[0_0_calc(50%-12px)] min-w-0">
              <MediaCard
                id={r.tmdbId}
                media_type={r.mediaType}
                title={r.title}
                posterPath=""
                vote_average={r.matchScore * 10}
                disableHoverModal={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: CSS grid */}
      <div className="hidden lg:grid lg:grid-cols-5 lg:gap-4">
        {results.map((r) => (
          <MediaCard
            key={`${r.mediaType}-${r.tmdbId}`}
            id={r.tmdbId}
            media_type={r.mediaType}
            title={r.title}
            posterPath=""
            vote_average={r.matchScore * 10}
            disableHoverModal={false}
          />
        ))}
      </div>
    </>
  );
}
