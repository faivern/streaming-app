import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import WatchProviderCard from "../cards/WatchProviderCard";
import "../../../style/TitleHover.css";
import TitleMid from "../title/TitleMid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type { WatchProviderListItem } from "../../../types/tmdb";

type Props = {
  providers: WatchProviderListItem[];
  loading?: boolean;
  region: string;
};

const MAX_PROVIDERS = 17;

export default function WatchProviderCarousel({
  providers,
  loading = false,
  region,
}: Props) {
  // Limit to top providers
  const displayProviders = providers.slice(0, MAX_PROVIDERS);

  // Page-based scrolling (following GenreCardList pattern)
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState(4);
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
    Math.ceil((displayProviders?.length ?? 0) / Math.max(1, pageSize))
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
  }, [pageSize, displayProviders?.length, clampPage, applyTranslate]);

  const prev = () => setPage((p) => clampPage(p - 1));
  const next = () => setPage((p) => clampPage(p + 1));

  const renderItems = loading
    ? Array.from({ length: 17 }).map((_, i) => ({
        provider_id: i,
        provider_name: "",
        logo_path: "",
        display_priority: i,
        display_priorities: {},
      }))
    : displayProviders;

  if (!providers.length && !loading) return null;

  return (
    <section className="px-6 sm:px-10 md:px-16 lg:px-20 xl:px-28 2xl:px-36 mt-8">
      <div className="flex items-center justify-between mb-1">
        <TitleMid>Streaming Services</TitleMid>
        <Link
          to={`/providers?region=${region}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span className="underline-hover">
          View all providers
          <span className="underline-bar"></span>
          </span>
        </Link>
      </div>

      <div className="relative -my-3 -mx-3">
        <div
          ref={viewportRef}
          className="overflow-hidden py-3 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 rounded-lg"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
          }}
          role="region"
          aria-label="Streaming services carousel"
        >
          <div
            ref={trackRef}
            className="flex gap-6 transition-transform duration-300 will-change-transform"
            style={{ transform: "translateX(0)" }}
          >
            {renderItems.map((provider: WatchProviderListItem) => (
              <div key={provider.provider_id} className="shrink-0">
                {loading ? (
                  <div className="flex flex-col items-center">
                    <div className="h-28 w-28 rounded-2xl bg-white/10 animate-pulse" />
                    <div className="h-4 w-20 mt-2 rounded bg-white/10 animate-pulse" />
                  </div>
                ) : (
                  <WatchProviderCard
                    providerId={provider.provider_id}
                    providerName={provider.provider_name}
                    logoPath={provider.logo_path}
                    region={region}
                  />
                )}
              </div>
            ))}
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
