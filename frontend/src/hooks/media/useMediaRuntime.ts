import { useMemo } from "react";

type UseMediaRuntimeProps = {
  mediaType: string;
  runtimeMin?: number | null;
  seasons?: number | null;
  episodes?: number | null;
};

export default function useMediaRuntime({
  mediaType,
  runtimeMin,
  seasons,
  episodes,
}: UseMediaRuntimeProps): string | null {
  return useMemo(() => {
    if (mediaType === "movie") {
      if (typeof runtimeMin !== "number" || runtimeMin <= 0) return null;

      const hours = Math.floor(runtimeMin / 60);
      const minutes = runtimeMin % 60;

      if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
      if (hours > 0) return `${hours}h`;
      return `${minutes}min`;
    }

    if (mediaType === "tv") {
      const seasonPart = seasons
        ? `${seasons} Season${seasons > 1 ? "s" : ""}`
        : null;
      const episodePart = episodes
        ? `${episodes} Episode${episodes > 1 ? "s" : ""}`
        : null;

      if (seasonPart && episodePart) return `${seasonPart} • ${episodePart}`;
      return seasonPart ?? episodePart;
    }

    return null;
  }, [mediaType, runtimeMin, seasons, episodes]);
}
