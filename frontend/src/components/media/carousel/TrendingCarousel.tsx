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
        {!loading && filtered.length > 0 && (
          <button
            onClick={goToPrev}
            aria-label="Previous"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2
                       bg-black/40 backdrop-blur-sm text-white/70
                       hover:bg-black/60 hover:text-white
                       rounded-full p-4 transition-all duration-300
                       shadow-[0_0_20px_rgba(0,0,0,0.5)]
                       hover:shadow-[0_0_30px_rgba(0,0,0,0.7)]
                       hover:scale-110 focus:outline-none cursor-pointer"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
          </button>
        )}

        <button
          onClick={goToNext}
          aria-label="Next"
          disabled={loading || filtered.length === 0}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2
                     bg-black/40 backdrop-blur-sm text-white/70
                     hover:bg-black/60 hover:text-white
                     disabled:opacity-0 disabled:cursor-not-allowed
                     rounded-full p-4 transition-all duration-300
                     shadow-[0_0_20px_rgba(0,0,0,0.5)]
                     hover:shadow-[0_0_30px_rgba(0,0,0,0.7)]
                     hover:scale-110 cursor-pointer focus:outline-none"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </button>

        <div className="relative w-full h-[60vh] md:h-[65vh] lg:h-[75vh] xl:h-[78vh] mb-6 transition-all duration-300 ease-in-out shadow-lg overflow-hidden">
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
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/60 via-black/30 to-transparent z-0 pointer-events-none" />
                  </Link>

                    <div
                    className="absolute bottom-6 sm:bottom-10 md:bottom-14 left-4 sm:left-8 md:left-12 z-20
                           flex flex-col gap-3
                           w-[calc(100%-2rem)] sm:w-[min(75%,36rem)] max-w-2xl
                           px-4 sm:px-6 py-4 sm:py-6
                           rounded-xl 
                           backdrop-blur-sm
                           shadow-lg
                           "
                    >
                    {/* Title / Logo */}
                    <div
                      className="flex items-start flex-wrap gap-2
                           min-h-10 sm:min-h-12 md:min-h-14
                           transition-all duration-300"
                    >
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
                    <p className="text-gray-300 line-clamp-3 text-lg leading-snug">
                      {m.overview || "No overview available."}
                    </p>
                  </div>
                </div>
              ))}
        </div>

        {/* Dots */}
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-6 xl:bottom-8 left-1/2 z-20 flex gap-2 -translate-x-1/2">
          {(loading ? Array.from({ length: 6 }) : filtered).map((_, idx) => {
            const isActive = !loading && idx === currentIndex;
            return (
              <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={isActive ? "true" : "false"}
              disabled={loading}
              onClick={() => !loading && setCurrentIndex(idx)}
              className={`h-1 sm:h-0.5 md:h-1 lg:h-1.5 xl:h-2 w-4 sm:w-6 md:w-8 lg:w-10 xl:w-12 rounded-full transition-all
                ${isActive
                ? "bg-gradient-to-r from-accent-primary to-accent-secondary scale-110 shadow"
                : "bg-gray-400/60 hover:bg-gradient-to-r hover:from-accent-primary/75 hover:to-accent-secondary/75"
                } disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-accent-primary/40`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}