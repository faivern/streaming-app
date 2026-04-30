import { useState, useCallback } from "react";
import { useAiDiscoverSession } from "../../context/AiDiscoverSessionContext";
import type { AiDiscoverResult } from "../../types/aiDiscover";

function interactionKey(mediaType: string, tmdbId: number) {
  return `${mediaType}-${tmdbId}`;
}

export function useSwipeStack(results: AiDiscoverResult[]) {
  const { setInteraction, removeInteraction } = useAiDiscoverSession();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [likedCount, setLikedCount] = useState(0);

  const totalCards = results.length;
  const isComplete = currentIndex >= totalCards;
  const currentCard = isComplete ? null : results[currentIndex];
  const currentStep = Math.min(currentIndex + 1, totalCards);

  const advance = useCallback(() => {
    setExitDirection(null);
    setCurrentIndex((i) => i + 1);
  }, []);

  const swipeLeft = useCallback(() => {
    if (isComplete || !currentCard || exitDirection) return;
    setInteraction(interactionKey(currentCard.mediaType, currentCard.tmdbId), "disliked");
    setExitDirection("left");
  }, [isComplete, currentCard, setInteraction, exitDirection]);

  const swipeRight = useCallback(() => {
    if (isComplete || !currentCard || exitDirection) return;
    setInteraction(interactionKey(currentCard.mediaType, currentCard.tmdbId), "liked");
    setLikedCount((c) => c + 1);
    setExitDirection("right");
  }, [isComplete, currentCard, setInteraction, exitDirection]);

  const revertSwipe = useCallback(() => {
    setExitDirection(null);
    setLikedCount((c) => Math.max(0, c - 1));
    if (currentCard) {
      removeInteraction(interactionKey(currentCard.mediaType, currentCard.tmdbId));
    }
  }, [currentCard, removeInteraction]);

  return {
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
  };
}
