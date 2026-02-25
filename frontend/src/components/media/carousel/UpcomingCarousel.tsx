import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { TrendingMedia } from "../../../types/tmdb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TitleMid from "../title/TitleMid.tsx";
import Backdrop from "../shared/Backdrop";
import RatingPill from "../../ui/RatingPill";
import { useSortChronological } from "../../../hooks/sorting/useSortChronological.ts";
import {
  faChevronLeft,
  faChevronRight,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import useEmblaCarousel from "embla-carousel-react";

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
  const releaseDateSort = useSortChronological(items);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: false,
  });

  const [prevEnabled, setPrevEnabled] = useState(false);
  const [nextEnabled, setNextEnabled] = useState(true);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setPrevEnabled(emblaApi.canScrollPrev());
      setNextEnabled(emblaApi.canScrollNext());
    };
    emblaApi.on("select", update);
    emblaApi.on("init", update);
    update();
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("init", update);
    };
  }, [emblaApi]);

  // Reset to first slide when mediaType changes
  useEffect(() => {
    emblaApi?.scrollTo(0);
  }, [mediaType, emblaApi]);

  const snapCount = emblaApi?.scrollSnapList().length ?? 0;
  const showDots = snapCount > 0 && snapCount <= 10;
  const [selectedSnap, setSelectedSnap] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedSnap(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("init", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("init", onSelect);
    };
  }, [emblaApi]);

  const title = mediaType === "movie" ? "Upcoming Movies" : "On The Air";

  return (
    <section className="px-page mt-8">
      <TitleMid>{title}</TitleMid>

      <div className="relative -my-3 -mx-3">
        <div
          ref={emblaRef}
          className="overflow-hidden py-3 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 rounded-lg"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
            if (e.key === "ArrowRight") emblaApi?.scrollNext();
          }}
          role="region"
          aria-label="Upcoming releases carousel"
        >
          <div className="flex gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-[0_0_calc(50%-12px)] sm:flex-[0_0_calc(33.333%-16px)] lg:flex-[0_0_calc(25%-18px)] min-w-0 shrink-0"
                  >
                    <div className="aspect-video rounded-2xl bg-white/10 animate-pulse" />
                  </div>
                ))
              : releaseDateSort.map((item, index) => {
                  const itemTitle = item.title || item.name || "Untitled";
                  const releaseDate =
                    mediaType === "movie"
                      ? item.release_date
                      : item.first_air_date;
                  const backdropPath = item.backdrop_path || "";
                  const shouldPrioritize = index < 4;

                  return (
                    <div
                      key={item.id}
                      className="flex-[0_0_calc(50%-12px)] sm:flex-[0_0_calc(33.333%-16px)] lg:flex-[0_0_calc(25%-18px)] min-w-0 shrink-0"
                    >
                      <Link to={`/media/${mediaType}/${item.id}`}>
                        <div
                          className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950
                            rounded-2xl border border-gray-400/30 overflow-hidden shadow-lg
                            hover:shadow-xl hover:scale-103 hover:border-accent-primary/75
                            transition-all duration-300 relative group cursor-pointer"
                        >
                          <RatingPill
                            rating={item.vote_average}
                            className="absolute top-2 right-2 z-10 bg-badge-primary/40 backdrop-blur-sm border-badge-foreground/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            showOutOfTen={false}
                          />
                          <Backdrop
                            path={backdropPath}
                            alt={itemTitle}
                            className="w-full aspect-video object-cover"
                            sizes="780px"
                            priority={shouldPrioritize}
                          />

                          {/* Hover gradient overlay with title + release date */}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="text-sm font-semibold text-white truncate">
                              {itemTitle}
                            </h3>
                            <div className="flex gap-2 text-xs text-accent-primary mt-1">
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
                    </div>
                  );
                })}
          </div>
        </div>

        {prevEnabled && (
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-0 inset-y-0 hidden lg:flex items-center justify-start pl-2 z-10 w-20
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
        {nextEnabled && (
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-0 inset-y-0 hidden lg:flex items-center justify-end pr-2 z-10 w-20
                       bg-gradient-to-l from-background via-background/60 to-transparent
                       text-white/60 hover:text-white
                       transition-all duration-300 cursor-pointer"
            aria-label="Next"
          >
            <span className="drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
              <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
            </span>
          </button>
        )}

        {showDots && (
          <div className="">
            <div className="flex items-center justify-center gap-2">
              {emblaApi?.scrollSnapList().map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi.scrollTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === selectedSnap ? "bg-sky-500 w-6" : "bg-gray-500/50 w-2"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
