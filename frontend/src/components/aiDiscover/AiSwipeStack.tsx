import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, CheckCircle2 } from "lucide-react";
import AiSwipeCard from "./AiSwipeCard";
import AddToListModal from "../lists/modals/AddToListModal";
import { useSwipeStack } from "../../hooks/aiDiscover/useSwipeStack";
import { useMediaDetailsBatch } from "../../hooks/media/useMediaDetailsBatch";
import { useUser } from "../../hooks/user/useUser";
import { swipeCardVariants, completionVariants } from "./animations";
import type { AiDiscoverResult } from "../../types/aiDiscover";

type AiSwipeStackProps = {
  results: AiDiscoverResult[];
  messageId: string;
};

export default function AiSwipeStack({ results, messageId }: AiSwipeStackProps) {
  const { data: user } = useUser();

  const {
    currentCard,
    currentIndex,
    currentStep,
    totalCards,
    isComplete,
    likedCount,
    exitDirection,
    swipeLeft,
    swipeRight,
    advance,
    revertSwipe,
  } = useSwipeStack(results);

  const detailQueries = useMediaDetailsBatch(
    results.map((r) => ({ id: r.tmdbId, mediaType: r.mediaType })),
  );

  const [addToListOpen, setAddToListOpen] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const [didSave, setDidSave] = useState(false);

  const currentDetail = detailQueries[currentIndex];

  const handleSwipeRight = useCallback(() => {
    if (!user) {
      swipeRight();
      return;
    }
    swipeRight();
    setPendingAdvance(true);
    setAddToListOpen(true);
  }, [user, swipeRight]);

  const handleModalClose = useCallback(() => {
    setAddToListOpen(false);
  }, []);

  const handleExitComplete = useCallback(() => {
    if (pendingAdvance && !addToListOpen && didSave) {
      setPendingAdvance(false);
      setDidSave(false);
      advance();
    }
  }, [pendingAdvance, addToListOpen, didSave, advance]);

  useEffect(() => {
    if (pendingAdvance && !addToListOpen) {
      if (didSave) {
        setPendingAdvance(false);
        setDidSave(false);
        advance();
      } else {
        setPendingAdvance(false);
        revertSwipe();
      }
    }
  }, [pendingAdvance, addToListOpen, didSave, advance, revertSwipe]);

  useEffect(() => {
    if (exitDirection && !pendingAdvance) {
      advance();
    }
  }, [exitDirection, pendingAdvance, advance]);

  useEffect(() => {
    if (isComplete) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        swipeLeft();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSwipeRight();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isComplete, swipeLeft, handleSwipeRight]);

  const mediaForModal = currentCard
    ? {
        tmdbId: currentCard.tmdbId,
        mediaType: currentCard.mediaType,
        title: currentCard.title,
        posterPath: currentDetail?.data?.poster_path ?? null,
        overview: currentDetail?.data?.overview ?? null,
        voteAverage: currentDetail?.data?.vote_average ?? null,
      }
    : null;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {isComplete
          ? `All done. You saved ${likedCount} of ${totalCards} recommendations.`
          : `Showing recommendation ${currentStep} of ${totalCards}: ${currentCard?.title}`}
      </div>

      {/* Card stack area */}
      <div className="relative min-h-[360px]">
        {/* Peek cards behind the active card */}
        {!isComplete &&
          [4, 3, 2, 1]
            .filter((offset) => offset <= results.length - currentIndex - 1)
            .map((offset) => {
              const peekIndex = currentIndex + offset;
              const peekDetail = detailQueries[peekIndex];
              const backdropPath = peekDetail?.data?.backdrop_path;
              return (
                <div
                  key={`peek-${peekIndex}`}
                  className="absolute inset-0 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--component-primary)] pointer-events-none origin-bottom-left"
                  style={{
                    transform: `rotate(${offset * 1.2}deg) translateX(${offset * 4}px)`,
                    opacity: 1 - offset * 0.15,
                    zIndex: -offset,
                    transition: "transform 0.35s ease, opacity 0.35s ease",
                  }}
                >
                  {backdropPath && (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${backdropPath}`}
                      alt=""
                      className="w-full aspect-video object-cover opacity-50"
                      draggable={false}
                    />
                  )}
                </div>
              );
            })}

        {/* Active card or completion */}
        <AnimatePresence
          mode="wait"
          onExitComplete={handleExitComplete}
        >
          {isComplete ? (
            <motion.div
              key="completion"
              variants={completionVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center justify-center text-center py-12 px-6"
            >
              <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
              <p className="text-sm text-[var(--subtle)]">
                You saved {likedCount} of {totalCards} recommendation{totalCards === 1 ? "" : "s"}
              </p>
            </motion.div>
          ) : currentCard ? (
            <motion.div
              key={`${currentCard.mediaType}-${currentCard.tmdbId}-${messageId}`}
              variants={swipeCardVariants}
              initial="enter"
              animate="active"
              exit={exitDirection === "right" ? "exitRight" : "exitLeft"}
            >
              <AiSwipeCard
                result={currentCard}
                detail={currentDetail?.data}
                isLoading={currentDetail?.isLoading ?? true}
                onSwipeLeft={swipeLeft}
                onSwipeRight={handleSwipeRight}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Progress dots + buttons */}
      {!isComplete && (
        <div className="mt-4 space-y-3">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5">
            {results.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < currentIndex
                    ? "bg-[var(--accent-primary)]/40 scale-75"
                    : i === currentIndex
                      ? "bg-[var(--accent-primary)] scale-110"
                      : "bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Skip / Save buttons */}
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={swipeLeft}
              aria-label="Skip this recommendation"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-400/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors duration-200 hover:cursor-pointer"
            >
              <X size={16} />
              Skip
            </button>
            <button
              type="button"
              onClick={handleSwipeRight}
              aria-label="Save this recommendation"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-green-400/30 text-green-400 text-sm font-medium hover:bg-green-500/10 transition-colors duration-200 hover:cursor-pointer"
            >
              <Heart size={16} />
              Save
            </button>
          </div>
        </div>
      )}

      {/* AddToListModal */}
      {mediaForModal && (
        <AddToListModal
          isOpen={addToListOpen}
          onClose={handleModalClose}
          onSave={() => setDidSave(true)}
          media={mediaForModal}
        />
      )}
    </div>
  );
}
