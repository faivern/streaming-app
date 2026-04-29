import { useState, useCallback } from "react";
import { useAiDiscoverSession } from "../../context/AiDiscoverSessionContext";
import type { AiDiscoverResult } from "../../types/aiDiscover";

function interactionKey(mediaType: string, tmdbId: number) {
  return `${mediaType}-${tmdbId}`;
}

export function useAiResultInteractions(
  primaryResults: AiDiscoverResult[],
  alternates: AiDiscoverResult[],
) {
  const { interactions, setInteraction } = useAiDiscoverSession();
  const [buffer, setBuffer] = useState<AiDiscoverResult[]>(alternates);
  const [visible, setVisible] = useState<AiDiscoverResult[]>(primaryResults);

  const handleLike = useCallback(
    (tmdbId: number, mediaType: string) => {
      setInteraction(interactionKey(mediaType, tmdbId), "liked");
    },
    [setInteraction],
  );

  const handleDislike = useCallback(
    (tmdbId: number, mediaType: string) => {
      setInteraction(interactionKey(mediaType, tmdbId), "disliked");
      setVisible((prev) => {
        const without = prev.filter(
          (r) => !(r.tmdbId === tmdbId && r.mediaType === mediaType),
        );
        setBuffer((buf) => {
          if (buf.length === 0) return buf;
          const [next, ...rest] = buf;
          without.push(next);
          return rest;
        });
        return without;
      });
    },
    [setInteraction],
  );

  const isLiked = useCallback(
    (tmdbId: number, mediaType: string) =>
      interactions[interactionKey(mediaType, tmdbId)] === "liked",
    [interactions],
  );

  return {
    visibleResults: visible,
    alternatesRemaining: buffer.length,
    handleLike,
    handleDislike,
    isLiked,
  };
}
