import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import { Film, Calendar, Clock, ChevronDown, ChevronUp, Play, X } from "lucide-react";
import { useVideo } from "../../hooks/useVideo";
import { mediaUrl } from "../../utils/urlBuilder";
import type { AiDiscoverResult } from "../../types/aiDiscover";
import type { DetailMedia } from "../../types/tmdb";

type AiSwipeCardProps = {
  result: AiDiscoverResult;
  detail?: DetailMedia;
  isLoading: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY = 300;
const TMDB_IMG = "https://image.tmdb.org/t/p";

function formatRuntime(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatTvLength(seasons?: number, episodes?: number): string | null {
  if (!seasons && !episodes) return null;
  const parts: string[] = [];
  if (seasons) parts.push(`${seasons} season${seasons === 1 ? "" : "s"}`);
  if (episodes) parts.push(`${episodes} ep`);
  return parts.join(" · ");
}

export default function AiSwipeCard({
  result,
  detail,
  isLoading,
  onSwipeLeft,
  onSwipeRight,
}: AiSwipeCardProps) {
  const x = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const closeTrailer = useCallback(() => setTrailerOpen(false), []);

  useEffect(() => {
    if (!trailerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTrailer();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [trailerOpen, closeTrailer]);

  const saveOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const skipOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);

  const backdropPath = detail?.backdrop_path;
  const posterPath = detail?.poster_path;
  const releaseDate = detail?.release_date ?? detail?.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const runtimeText = formatRuntime(detail?.runtime);
  const tvLengthText = formatTvLength(detail?.number_of_seasons, detail?.number_of_episodes);
  const genres = detail?.genres?.slice(0, 3);
  const { videoUrl: trailerUrl } = useVideo(
    result.mediaType as "movie" | "tv",
    result.tmdbId,
    !isLoading,
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    const { offset, velocity } = info;

    if (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY) {
      onSwipeRight();
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY) {
      onSwipeLeft();
    }
  };

  return (
    <>
    <motion.div
      drag="x"
      dragDirectionLock
      dragElastic={0.4}
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate }}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      className={`relative select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
    >
      {/* Swipe overlays */}
      <motion.div
        style={{ opacity: saveOpacity }}
        className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-green-500/20 border-2 border-green-400/50 pointer-events-none"
      >
        <span className="text-3xl font-bold text-green-400 rotate-[-12deg] border-3 border-green-400 rounded-lg px-4 py-1">
          SAVE
        </span>
      </motion.div>
      <motion.div
        style={{ opacity: skipOpacity }}
        className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-red-500/20 border-2 border-red-400/50 pointer-events-none"
      >
        <span className="text-3xl font-bold text-red-400 rotate-[12deg] border-3 border-red-400 rounded-lg px-4 py-1">
          SKIP
        </span>
      </motion.div>

      {/* Card body */}
      <div className="bg-[var(--component-primary)] rounded-2xl border border-[var(--accent-primary)]/30 overflow-hidden shadow-xl">
        {/* Backdrop */}
        <div className="relative aspect-video overflow-hidden">
          {isLoading || !backdropPath ? (
            <div className="w-full h-full bg-white/5 animate-pulse flex items-center justify-center">
              <Film className="w-12 h-12 text-white/10" />
            </div>
          ) : (
            <img
              src={`${TMDB_IMG}/w780${backdropPath}`}
              srcSet={`${TMDB_IMG}/w780${backdropPath} 780w, ${TMDB_IMG}/w1280${backdropPath} 1280w`}
              sizes="(max-width: 640px) 100vw, 640px"
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--component-primary)] via-transparent to-transparent" />

          {/* Poster overlay */}
          {!isLoading && posterPath && (
            <div className="absolute bottom-0 left-4 translate-y-1/3 w-16 sm:w-20 rounded-lg overflow-hidden shadow-lg border border-white/10">
              <img
                src={`${TMDB_IMG}/w185${posterPath}`}
                alt={result.title}
                className="w-full aspect-[2/3] object-cover"
                draggable={false}
              />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="px-4 pt-8 pb-4 space-y-2">
          {isLoading ? (
            <>
              <div className="h-6 bg-white/5 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-white/5 rounded animate-pulse w-1/2" />
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={mediaUrl(result.mediaType, result.tmdbId, result.title)}
                  className="block hover:underline min-w-0"
                  onClick={(e) => { if (dragging) e.preventDefault(); }}
                >
                  <h3 className="text-lg font-bold text-white leading-snug">
                    {result.title}
                  </h3>
                </Link>
                {trailerUrl && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setTrailerOpen(true); }}
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 rounded-full px-3 py-1.5 hover:bg-[var(--accent-primary)]/10 transition-colors duration-200 hover:cursor-pointer"
                  >
                    <Play size={12} />
                    Trailer
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--subtle)]">
                {year && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {year}
                  </span>
                )}
                {runtimeText && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {runtimeText}
                  </span>
                )}
                {!runtimeText && tvLengthText && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {tvLengthText}
                  </span>
                )}
                {detail?.vote_average != null && detail.vote_average > 0 && (
                  <span>★ {detail.vote_average.toFixed(1)}</span>
                )}
              </div>

              {genres && genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {genres.map((g) => (
                    <span
                      key={g.id}
                      className="text-xs px-2 py-0.5 rounded-full bg-white/[0.08] text-[var(--subtle)]"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {detail?.overview && (
                <div>
                  <p className={`text-xs text-white/70 leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>
                    {detail.overview}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
                    className="flex items-center gap-1 text-[10px] text-[var(--accent-primary)] mt-1 hover:underline"
                  >
                    {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {expanded ? "Show less" : "Show more"}
                  </button>
                </div>
              )}

            </>
          )}

        </div>
      </div>
    </motion.div>

    {/* Trailer modal */}
    <AnimatePresence>
      {trailerOpen && trailerUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={closeTrailer}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeTrailer}
              aria-label="Close trailer"
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors hover:cursor-pointer"
            >
              <X size={24} />
            </button>
            <iframe
              src={`${trailerUrl}${trailerUrl.includes("?") ? "&" : "?"}autoplay=1&rel=0`}
              title={`${result.title} Trailer`}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
