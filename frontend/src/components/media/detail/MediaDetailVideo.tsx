import { FaPlay } from "react-icons/fa";
import { useEffect, useMemo, useRef, useState } from "react";
import Backdrop from "../shared/Backdrop";
import type { MediaType } from "../../../types/tmdb";
import { useVideo } from "../../../hooks/useVideo";
import MediaVideoCTA from "./MediaVideoCTA";

type Props = {
  backdrop_path: string;
  poster_path?: string;
  title?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  media_type: MediaType;
  id: number;
  onScrollToWatchProviders?: () => void;
  onAddToList?: () => void;
};

const IFRAME_ALLOW = "autoplay; encrypted-media; picture-in-picture";
const WRAPPER_MAX_W = "max-w-6xl";
const CTA_DELAY_MS = 3000;

export default function MediaDetailVideo({
  backdrop_path,
  poster_path,
  title,
  isPlaying: externalIsPlaying,
  onPlay,
  media_type,
  id,
  onScrollToWatchProviders,
  onAddToList,
}: Props) {
  const [isPlaying, setIsPlaying] = useState<boolean>(!!externalIsPlaying);
  const [shouldFetchVideo, setShouldFetchVideo] = useState<boolean>(false);
  const [showCTA, setShowCTA] = useState(false);
  const ctaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only fetch video when user clicks play
  const { videoUrl, loading: trailerLoading } = useVideo(
    media_type,
    id,
    shouldFetchVideo,
  );

  // Keep internal state in sync with parent
  useEffect(() => {
    if (externalIsPlaying) {
      setIsPlaying(true);
      setShouldFetchVideo(true);
    }
  }, [externalIsPlaying]);

  // Start CTA timer when video is playing
  useEffect(() => {
    if (isPlaying && videoUrl) {
      ctaTimerRef.current = setTimeout(() => setShowCTA(true), CTA_DELAY_MS);
    }
    return () => {
      if (ctaTimerRef.current) clearTimeout(ctaTimerRef.current);
    };
  }, [isPlaying, videoUrl]);

  const mediaTitle = useMemo(
    () => (title?.trim() ? title : "Trailer"),
    [title],
  );

  const handlePlayClick = () => {
    setShouldFetchVideo(true);
    setIsPlaying(true);
    onPlay?.();
  };

  // Add autoplay parameter when video is ready
  const autoplayVideoUrl = useMemo(() => {
    if (!videoUrl || !isPlaying) return videoUrl;

    const separator = videoUrl.includes("?") ? "&" : "?";
    return `${videoUrl}${separator}autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&disablekb=0`;
  }, [videoUrl, isPlaying]);

  const showTrailer = isPlaying && !!videoUrl;
  const showLoading = shouldFetchVideo && trailerLoading;
  const showBackdrop = !shouldFetchVideo && !!backdrop_path;
  const showError = shouldFetchVideo && !trailerLoading && !videoUrl;
  const showPosterFallback = showError && !!poster_path;

  const hasCTAHandlers = !!onScrollToWatchProviders || !!onAddToList;

  return (
    <div
      className={`relative m-4 overflow-hidden rounded-lg shadow-2xl group mx-auto border border-badge-foreground ${WRAPPER_MAX_W}`}
    >
      {/* Media area */}
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
        {showTrailer && (
          <iframe
            src={autoplayVideoUrl!}
            title={`${mediaTitle} Trailer`}
            className="w-full h-full"
            allow={IFRAME_ALLOW}
            allowFullScreen
          />
        )}

        {showLoading && (
          <div className="w-full h-full flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-gray-200">Loading trailer…</span>
            </div>
          </div>
        )}

        {showPosterFallback && (
          <img
            src={`https://image.tmdb.org/t/p/w780${poster_path}`}
            srcSet={`https://image.tmdb.org/t/p/w300${poster_path} 300w, https://image.tmdb.org/t/p/w780${poster_path} 780w, https://image.tmdb.org/t/p/w1280${poster_path} 1280w`}
            sizes="(max-width: 768px) 100vw, 1280px"
            alt={mediaTitle}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}

        {showError && !showPosterFallback && (
          <div className="w-full h-full flex items-center justify-center bg-black/80">
            <div className="text-center px-6 py-4 bg-red-900/90 rounded-lg">
              <p className="text-white font-semibold">
                No trailer available
              </p>
              <p className="text-gray-300 text-sm mt-1">
                This content doesn't have a trailer
              </p>
            </div>
          </div>
        )}

        {showBackdrop && (
          <Backdrop
            path={backdrop_path}
            alt={mediaTitle}
            className="w-full h-full rounded-lg"
            sizes="100vw"
            priority
          />
        )}
      </div>

      {/* CTA overlay when trailer is playing */}
      {showTrailer && hasCTAHandlers && (
        <MediaVideoCTA
          visible={showCTA}
          onScrollToWatchProviders={onScrollToWatchProviders ?? (() => {})}
          onAddToList={onAddToList ?? (() => {})}
        />
      )}

      {/* Overlay play button when not playing */}
      {!shouldFetchVideo && (
        <>
          <div className="absolute inset-0 backdrop-blur bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              type="button"
              onClick={handlePlayClick}
              aria-label="Play trailer"
              className="bg-gray-100/80 hover:bg-gray-100 text-black p-4 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 animate-pulse"
            >
              <FaPlay className="text-xl" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
