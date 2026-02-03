import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import type { TrendingMedia } from "../../../types/tmdb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TitleMid from "../title/TitleMid.tsx";
import Backdrop from "../shared/Backdrop";
import RatingPill from "../../ui/RatingPill";
import "../../../style/MediaCard.css";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  items: TrendingMedia[];
  loading?: boolean;
  mediaType: "movie" | "tv";
};

export default function Top10Carousel({
  items,
  loading = false,
  mediaType,
}: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(3);
  const [page, setPage] = useState(0);

  // Only take top 10 items
  const top10Items = items.slice(0, 10);

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
    Math.ceil((top10Items?.length ?? 0) / Math.max(1, pageSize))
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
  }, [pageSize, top10Items?.length, clampPage, applyTranslate]);

  useEffect(() => {
    setPage(0);
  }, [mediaType]);

  const prev = () => setPage((p) => clampPage(p - 1));
  const next = () => setPage((p) => clampPage(p + 1));

  const renderItems = loading
    ? Array.from({ length: 10 }).map((_, i) => ({ id: i }) as TrendingMedia)
    : top10Items;

  const title = mediaType === "movie" ? "Top 10 Movies" : "Top 10 TV Shows";

  return (
    <section className="px-6 sm:px-10 md:px-16 lg:px-20 xl:px-28 2xl:px-36 mt-8">
      <TitleMid>{title}</TitleMid>

      <div className="relative -my-3 -mx-3">
        <div ref={viewportRef} className="overflow-hidden py-3 px-3">
          <div
            ref={trackRef}
            className="flex gap-6 transition-transform duration-300 will-change-transform"
            style={{ transform: "translateX(0)" }}
          >
            {renderItems.map((item, index) => {
              const itemTitle = item.title || item.name || "Untitled";
              const backdropPath = item.backdrop_path || "";
              const rank = index + 1;

              return (
                <div key={item.id} className="shrink-0">
                  {loading ? (
                    <div className="aspect-video rounded-2xl bg-white/10 animate-pulse" />
                  ) : (
                    <Link
                      to={`/media/${mediaType}/${item.id}`}
                      className="block group group/card"
                    >
                      <div className="relative flex items-center">
                        {/* Large ranking number - hollow by default, fills on hover */}
                        <span
                          className="absolute bottom-0 right-0 pb-4 pr-4 z-10 text-[8rem] font-black leading-none select-none
                            transition-all duration-300 ease-out
                            text-transparent
                            [--stroke-color:var(--accent-primary)]
                            drop-shadow-[0_0_8px_rgba(0,0,0,0.6)]
                            group-hover/card:text-[9rem]
                            group-hover/card:bg-gradient-to-br group-hover/card:from-accent-primary group-hover/card:to-accent-secondary
                            group-hover/card:bg-clip-text
                            group-hover/card:[--stroke-color:rgba(0,40,60,0.7)]
                            group-hover/card:drop-shadow-[0_4px_12px_rgba(0,200,255,0.3)]"
                          style={{
                            fontFamily: "system-ui, sans-serif",
                            WebkitTextStroke: "3px var(--stroke-color)",
                            paintOrder: "stroke fill",
                          }}
                        >
                          {rank}
                        </span>

                        <div
                          className="w-lg bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950
                            rounded-2xl border border-gray-400/30 overflow-hidden shadow-lg
                            hover:shadow-xl hover:scale-105 hover:border-accent-primary/75
                            transition-all duration-300 relative cursor-pointer"
                        >
                          <span className="shine-overlay" />
                          <RatingPill
                            rating={item.vote_average}
                            className="absolute top-2 right-2 z-10 bg-badge-primary/40 backdrop-blur-sm border-badge-foreground/40 rounded-xl"
                            showOutOfTen={false}
                          />

                          <Backdrop
                            path={backdropPath}
                            alt={itemTitle}
                            className="w-full aspect-video object-cover"
                            sizes="780px"
                            priority={false}
                          />

                          <div className="p-3 flex flex-wrap items-center justify-between">
                            <h3 className="text-md font-semibold text-white truncate mb-2">
                              {itemTitle.length > 35
                                ? `${itemTitle.slice(0, 35)}...`
                                : itemTitle}
                            </h3>
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
            className="absolute left-0 inset-y-0 z-10 w-20 flex items-center justify-start pl-2
                       bg-gradient-to-r from-background via-background/60 to-transparent
                       text-white/60 hover:text-white
                       transition-all duration-300 cursor-pointer"
            aria-label="Previous"
          >
            <span className="drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
              <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={next}
          disabled={page >= pageCount - 1}
          className="absolute right-0 inset-y-0 z-10 w-20 flex items-center justify-end pr-2
                     bg-gradient-to-l from-background via-background/60 to-transparent
                     text-white/60 hover:text-white
                     disabled:opacity-0 disabled:pointer-events-none
                     transition-all duration-300 cursor-pointer"
          aria-label="Next"
        >
          <span className="drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
            <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
          </span>
        </button>

        <div className="">
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
