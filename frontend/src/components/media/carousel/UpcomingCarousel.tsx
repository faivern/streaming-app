import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import type { TrendingMedia } from "../../../types/tmdb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TitleMid from "../title/TitleMid.tsx";
import Backdrop from "../shared/Backdrop";
import RatingPill from "../../ui/RatingPill";
import {
  faChevronLeft,
  faChevronRight,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  items: TrendingMedia[];
  loading?: boolean;
  mediaType: "movie" | "tv";
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "TBA";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function UpcomingCarousel({
  items,
  loading = false,
  mediaType,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(3);
  const [page, setPage] = useState(0);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || track.children.length === 0) return;

    const first = track.children[0] as HTMLElement;
    const second = track.children[1] as HTMLElement | undefined;

    const w1 = first.getBoundingClientRect().width;
    const step = second ? second.offsetLeft - first.offsetLeft : w1;
    const vw = viewport.clientWidth;
    setPageSize(Math.max(1, Math.floor((vw + 1) / step)));
  }, []);

  const pageCount = Math.max(
    1,
    Math.ceil((items?.length ?? 0) / Math.max(1, pageSize))
  );

  const clampPage = useCallback(
    (p: number) => Math.min(Math.max(0, p), Math.max(0, pageCount - 1)),
    [pageCount]
  );

  const applyTranslate = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const startIndex = page * pageSize;
    const target = track.children[startIndex] as HTMLElement | undefined;
    track.style.transform = target
      ? `translateX(${-target.offsetLeft}px)`
      : "translateX(0)";
  }, [page, pageSize]);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    setPage((p) => clampPage(p));
    applyTranslate();
  }, [pageSize, items?.length, clampPage, applyTranslate]);

  useEffect(() => {
    setPage(0);
  }, [mediaType]);

  const prev = () => setPage((p) => clampPage(p - 1));
  const next = () => setPage((p) => clampPage(p + 1));

  const renderItems = loading
    ? Array.from({ length: 8 }).map((_, i) => ({ id: i }) as TrendingMedia)
    : items;

  const title = mediaType === "movie" ? "Upcoming Movies" : "On The Air";

  return (
    <section className="md:mx-8 px-4 sm:px-6 lg:px-8 mt-8">
      <TitleMid>{title}</TitleMid>

      <div className="relative -my-3">
        <div ref={viewportRef} className="overflow-hidden py-3">
          <div
            ref={trackRef}
            className="flex gap-6 transition-transform duration-300 will-change-transform"
            style={{ transform: "translateX(0)" }}
          >
            {renderItems.map((item, index) => {
              const itemTitle = item.title || item.name || "Untitled";
              const releaseDate =
                mediaType === "movie" ? item.release_date : item.first_air_date;
              const backdropPath = item.backdrop_path || "";
              const shouldPrioritize = index < 4; // Eager-load first 4 items

              return (
                <div key={item.id} className="shrink-0 w-[320px]">
                  {loading ? (
                    <div className="aspect-video w-full rounded-2xl bg-white/10 animate-pulse" />
                  ) : (
                    <Link to={`/media/${mediaType}/${item.id}`}>
                      <div
                        className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950
                          rounded-2xl border border-gray-400/30 overflow-hidden shadow-lg
                          hover:shadow-xl hover:scale-105 hover:border-accent-primary/75
                          transition-all duration-300 relative group cursor-pointer"
                      >
                        <RatingPill
                          rating={item.vote_average}
                          className="absolute top-2 right-2 z-10 bg-badge-primary/40 backdrop-blur-sm border-badge-foreground/40 rounded-xl"
                          showOutOfTen={false}
                        />
                        <span className="shine-overlay" />
                        <Backdrop
                          path={backdropPath}
                          alt={itemTitle}
                          className="w-full aspect-video object-cover"
                          sizes="320px"
                          priority={shouldPrioritize}
                        />

                        <div className="p-3 flex flex-wrap items-center justify-between">
                          <h3 className="text-sm font-semibold text-white truncate mb-2">
                            {itemTitle.length > 35
                              ? `${itemTitle.slice(0, 35)}...`
                              : itemTitle}
                          </h3>

                          <div className="flex gap-2 text-xs text-accent-primary">
                            <FontAwesomeIcon
                              icon={faCalendar}
                              className="text-accent-secondary"
                            />
                            <span className="font-medium">
                              {formatDate(releaseDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {page > 0 && (
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full
                       bg-gray-900/70 backdrop-blur border border-white/10 text-white
                       hover:bg-gray-800/80 hover:cursor-pointer"
            aria-label="Previous"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}
        <button
          type="button"
          onClick={next}
          disabled={page >= pageCount - 1}
          className="absolute right-2 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full
                     bg-gray-900/70 backdrop-blur border border-white/10 text-white
                     hover:bg-gray-800/80 disabled:opacity-40 disabled:cursor-not-allowed hover:cursor-pointer"
          aria-label="Next"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        <div className="absolute inset-x-0 bottom-0">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Go to page ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === page ? "bg-sky-500 w-6" : "bg-gray-500/50 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
