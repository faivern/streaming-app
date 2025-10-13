import { FaPlay } from "react-icons/fa";
import { useEffect, useMemo, useState } from "react";
import Backdrop from "../shared/Backdrop";
import type { MediaType } from "../../../types/tmdb";
import { useVideo } from "../../../hooks/useVideo";

type Props = {
  backdrop_path: string;
  poster_path?: string;
  title?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  media_type: MediaType;
  id: number;
};

const IFRAME_ALLOW = "autoplay; encrypted-media; picture-in-picture";
const WRAPPER_MAX_W = "max-w-6xl";

export default function MediaDetailVideo({
  backdrop_path,
  poster_path,
  title,
  isPlaying: externalIsPlaying,
  onPlay,
  media_type,
  id,
}: Props) {
  const [isPlaying, setIsPlaying] = useState<boolean>(!!externalIsPlaying);
  const [shouldFetchVideo, setShouldFetchVideo] = useState<boolean>(false);

  // Debug logging
  useEffect(() => {
    console.log("🔍 MediaDetailVideo Props:", {
      media_type,
      id,
      title,
      shouldFetchVideo,
      isPlaying,
    });
  }, [media_type, id, title, shouldFetchVideo, isPlaying]);

  // Only fetch video when user clicks play
  const { videoUrl, loading: trailerLoading } = useVideo(
    media_type,
    id,
    shouldFetchVideo
  );

  // Debug video fetch results
  useEffect(() => {
    if (shouldFetchVideo) {
      console.log("🎬 Video Fetch Result:", {
        videoUrl,
        trailerLoading,
        fetchUrl: `${
          import.meta.env.VITE_BACKEND_API_URL
        }/api/Movies/${media_type}/${id}/trailer`,
      });
    }
  }, [videoUrl, trailerLoading, shouldFetchVideo, media_type, id]);

  // Keep internal state in sync with parent
  useEffect(() => {
    if (externalIsPlaying) {
      setIsPlaying(true);
      setShouldFetchVideo(true);
    }
  }, [externalIsPlaying]);

  const mediaTitle = useMemo(
    () => (title?.trim() ? title : "Trailer"),
    [title]
  );

  const handlePlayClick = () => {
    console.log("🎬 Play button clicked - fetching video...", {
      media_type,
      id,
      backendUrl: import.meta.env.VITE_BACKEND_API_URL,
    });
    setShouldFetchVideo(true); // Start fetching
    setIsPlaying(true);
    onPlay?.();
  };

  // Add autoplay parameter when video is ready
  const autoplayVideoUrl = useMemo(() => {
    if (!videoUrl || !isPlaying) return videoUrl;

    const separator = videoUrl.includes("?") ? "&" : "?";
    return `${videoUrl}${separator}autoplay=1`;
  }, [videoUrl, isPlaying]);

  const showTrailer = isPlaying && !!videoUrl;
  const showLoading = shouldFetchVideo && trailerLoading;
  const showBackdrop = !shouldFetchVideo && !!backdrop_path;
  const showError = shouldFetchVideo && !trailerLoading && !videoUrl;
  const showPosterFallback = showError && !!poster_path;

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
            alt={mediaTitle}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {showError && !showPosterFallback && (
          <div className="w-full h-full flex items-center justify-center bg-black/80">
            <div className="text-center px-6 py-4 bg-red-900/90 rounded-lg">
              <p className="text-white font-semibold">
                ⚠️ No trailer available
              </p>
              <p className="text-gray-300 text-sm mt-1">
                This content doesn't have a trailer
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Tried: /api/Movies/{media_type}/{id}/trailer
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
