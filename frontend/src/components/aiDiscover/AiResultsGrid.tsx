import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import AiResultCard from "./AiResultCard";
import { useMediaDetailsBatch } from "../../hooks/media/useMediaDetailsBatch";
import { cardStaggerContainer, cardStaggerItem } from "./animations";
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

  const detailQueries = useMediaDetailsBatch(
    results.map((r) => ({ id: r.tmdbId, mediaType: r.mediaType })),
  );

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite">
        {results.length} recommendation{results.length === 1 ? "" : "s"} loaded
      </div>

      <motion.div
        variants={cardStaggerContainer}
        initial="hidden"
        animate="visible"
        className="overflow-hidden min-w-0"
        ref={emblaRef}
      >
        <div className="flex gap-3 md:gap-4">
          {results.map((r, i) => {
            const q = detailQueries[i];
            return (
              <motion.div
                key={`${r.mediaType}-${r.tmdbId}`}
                variants={cardStaggerItem}
                className="flex-[0_0_80%] md:flex-[0_0_240px] min-w-0"
              >
                <AiResultCard
                  result={r}
                  detail={q?.data}
                  isLoading={q?.isLoading ?? true}
                  isError={q?.isError ?? false}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
