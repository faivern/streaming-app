import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import AiResultCard from "./AiResultCard";
import { useMediaDetailsBatch } from "../../hooks/media/useMediaDetailsBatch";
import { useAiResultInteractions } from "../../hooks/aiDiscover/useAiResultInteractions";
import { cardStaggerContainer, cardStaggerItem, cardEnterVariants } from "./animations";
import type { AiDiscoverResult } from "../../types/aiDiscover";

type AiResultsGridProps = {
  results: AiDiscoverResult[];
  alternates: AiDiscoverResult[];
  messageId: string;
};

export default function AiResultsGrid({ results, alternates, messageId }: AiResultsGridProps) {
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: false,
  });

  const { visibleResults, alternatesRemaining, handleLike, handleDislike, isLiked } =
    useAiResultInteractions(results, alternates);

  const detailQueries = useMediaDetailsBatch(
    visibleResults.map((r) => ({ id: r.tmdbId, mediaType: r.mediaType })),
  );

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite">
        {visibleResults.length} recommendation{visibleResults.length === 1 ? "" : "s"} loaded
      </div>

      <motion.div
        variants={cardStaggerContainer}
        initial="hidden"
        animate="visible"
        className="overflow-hidden min-w-0"
        ref={emblaRef}
      >
        <div className="flex gap-3 md:gap-4">
          <AnimatePresence mode="popLayout">
            {visibleResults.map((r, i) => {
              const q = detailQueries[i];
              return (
                <motion.div
                  key={`${r.mediaType}-${r.tmdbId}-${messageId}`}
                  variants={cardStaggerItem}
                  exit={{ opacity: 0, scale: 0.9, x: -20, transition: { duration: 0.3 } }}
                  layout
                  className="flex-[0_0_80%] md:flex-[0_0_240px] min-w-0"
                >
                  <AiResultCard
                    result={r}
                    detail={q?.data}
                    isLoading={q?.isLoading ?? true}
                    isError={q?.isError ?? false}
                    onLike={() => handleLike(r.tmdbId, r.mediaType)}
                    onDislike={() => handleDislike(r.tmdbId, r.mediaType)}
                    liked={isLiked(r.tmdbId, r.mediaType)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {visibleResults.length === 0 && (
        <motion.p
          variants={cardEnterVariants}
          initial="hidden"
          animate="visible"
          className="text-sm text-[var(--subtle)] text-center mt-3"
        >
          No results left — try a new query for more options.
        </motion.p>
      )}

      {visibleResults.length > 0 && alternatesRemaining === 0 && visibleResults.length < results.length && (
        <p className="text-xs text-[var(--subtle)] text-center mt-2">
          No more alternates available
        </p>
      )}
    </>
  );
}
