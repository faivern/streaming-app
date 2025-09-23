import { useEffect, useRef, useState } from "react";
import type { TrendingMedia } from "../../../types/tmdb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Backdrop from "../../media/shared/Backdrop";
import RatingPill from "../../ui/RatingPill";
import GenrePill from "../../ui/GenrePill";
import DatePill from "../../ui/DatePill";
import { useMediaLogo } from "../../../hooks/images/useMediaLogo";
import Logo from "../shared/EnhancedTitle";

type Props = {
  items: TrendingMedia[];
  loading?: boolean;
};

export default function TrendingCarousel({ items, loading = false }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const intervalTime = 6000;

  // only movie/tv with backdrop
  const filtered = (items ?? []).filter(
    (m) =>
      (m.media_type === "movie" || m.media_type === "tv") && m.backdrop_path
  );

  // autoplay
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!loading && filtered.length > 0) {
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((i) => (i + 1) % filtered.length);
      }, intervalTime);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loading, filtered.length]);

  const goToPrev = () => {
    if (!filtered.length) return;
    setCurrentIndex((i) => (i - 1 + filtered.length) % filtered.length);
  };
  const goToNext = () => {
    if (!filtered.length) return;
    setCurrentIndex((i) => (i + 1) % filtered.length);
  };

  // skeletons vs real data
  const slides = loading
    ? Array.from({ length: 6 }).map((_, i) => i)
    : filtered;
  const current = filtered[currentIndex];

  const mediaType =
    current?.media_type === "movie" || current?.media_type === "tv"
      ? current.media_type
      : undefined;
  const { data: logoPath } = useMediaLogo(mediaType, current?.id);

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden -mt-40">
        {/* Arrows */}
        <button
          onClick={goToPrev}
          aria-label="Previous"
          disabled={loading || filtered.length === 0}
          className="absolute left-6 top-1/2 z-20 -translate-y-1/2 bg-gray-900/50 backdrop-blur-md text-white 
                     hover:bg-gray-800/80 disabled:opacity-40 disabled:cursor-not-allowed 
                     rounded-full p-3 transition-all duration-200 shadow-md border border-gray-700/30 
                     hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/40 cursor-pointer"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
        </button>

        <button
          onClick={goToNext}
          aria-label="Next"
          disabled={loading || filtered.length === 0}
          className="absolute right-6 top-1/2 z-20 -translate-y-1/2 bg-gray-900/50 backdrop-blur-md text-white 
                     hover:bg-gray-800/80 disabled:opacity-40 disabled:cursor-not-allowed 
                     rounded-full p-3 transition-all duration-200 shadow-md border border-gray-700/30 
                     hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500/40"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
        </button>

        <div className="relative w-full h-[60vh] md:h-[65vh] lg:h-[66vh] xl:h-[68vh] mb-6 transition-all duration-300 ease-in-out shadow-lg overflow-hidden">
          {loading
            ? slides.map((i) => (
                <div
                  key={i}
                  className={`absolute inset-0 ${
                    i === 0 ? "opacity-100 z-10" : "opacity-0 z-0"
                  } pointer-events-none`}
                >
                  <div className="w-full h-full bg-white/10 animate-pulse" />
                </div>
              ))
            : filtered.map((m, idx) => (
                <div
                  key={m.id}
                  className={`absolute inset-0 transition-opacity duration-800 ${
                    idx === currentIndex
                      ? "opacity-100 z-10 pointer-events-auto"
                      : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <Link to={`/media/${m.media_type}/${m.id}`}>
                    <div className="absolute bottom-0 left-0 w-full h-15 bg-gradient-to-b from-transparent to-background z-10"></div>
                    <Backdrop
                      path={m.backdrop_path}
                      alt={m.title || m.name || "Backdrop"}
                      className="w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out"
                      sizes="100vw"
                      priority={idx === currentIndex}
                    />
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/70 via-black/30 to-transparent z-0 pointer-events-none" />
                  </Link>

                  <div className="flex flex-col gap-4 absolute bottom-12 left-12 z-20 max-w-xl bg-gray-700/5 p-6 rounded-xl backdrop-blur-sm shadow-lg">
                    {/* Title / Logo */}
                    <div className="flex items-center justify-between flex-wrap gap-2 min-h-12 md:min-h-14 lg:min-h-16 transition-all duration-300 ease-in-out">
                      {idx === currentIndex &&
                        (logoPath ? (
                          <Logo
                            path={logoPath}
                            alt={m.title || m.name || "Title logo"}
                            className="max-h-16 w-auto max-w-xs"
                            sizes="(max-width: 768px) 200px, 300px"
                          />
                        ) : (
                          <h2 className="text-white text-3xl font-bold">
                            {m.title || m.name}
                          </h2>
                        ))}
                    </div>
                    {/* Meta */}
                    <div className="space-y-2" aria-label="Media metadata">
                      <div className="flex flex-wrap items-center gap-4 pb-1">
                        {m.vote_average != null && m.vote_average > 0 && (
                          <RatingPill
                            rating={m.vote_average}
                            className="!bg-transparent !border-0 !shadow-none !px-0 !py-0 text-gray-200"
                          />
                        )}
                        {(m.release_date || m.first_air_date) && (
                          <DatePill
                            date={m.release_date || m.first_air_date}
                            className="!bg-transparent !border-0 !shadow-none !px-0 !py-0 text-gray-400"
                            title="Release date"
                          />
                        )}
                      </div>

                      {m.genre_ids?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {m.genre_ids.slice(0, 3).map((id) => (
                            <GenrePill
                              key={id}
                              id={id}
                              className="bg-badge-primary/70 border-badge-foreground/40 shadow-sm"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic">
                          No genres
                        </div>
                      )}
                    </div>

                    {/* Overview */}
                    <p className="text-gray-300 text-base leading-relaxed line-clamp-4">
                      {m.overview || "No overview available."}
                    </p>
                  </div>
                </div>
              ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 z-20 flex gap-2 -translate-x-1/2">
          {(loading ? Array.from({ length: 6 }) : filtered).map((_, idx) => (
            <button
              key={idx}
              className={`w-8 h-1.5 rounded-full transition-all ${
                !loading && idx === currentIndex
                  ? "bg-gradient-to-r from-accent-primary to-accent-secondary scale-125 shadow hover:cursor-pointer"
                  : "bg-gray-400/60 hover:bg-gradient-to-r from-accent-primary/75 to-accent-secondary/75 cursor-pointer"
              }`}
              onClick={() => !loading && setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{ outline: "none" }}
              disabled={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
