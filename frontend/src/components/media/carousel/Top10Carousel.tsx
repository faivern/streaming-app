import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link } from "react-router-dom";
import type { TrendingMedia } from "../../../types/tmdb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TitleMid from "../title/TitleMid.tsx";
import Backdrop from "../shared/Backdrop";
import RatingPill from "../../ui/RatingPill";
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: false,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => {
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("init", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("init", onSelect);
    };
  }, [emblaApi]);

  // Reset to first slide when mediaType changes
  useEffect(() => {
    emblaApi?.scrollTo(0);
  }, [mediaType, emblaApi]);

  // Only take top 10 items
  const top10Items = items.slice(0, 10);

  const renderItems = loading
    ? Array.from({ length: 10 }).map((_, i) => ({ id: i }) as TrendingMedia)
    : top10Items;

  const title = mediaType === "movie" ? "Top 10 Movies" : "Top 10 TV Shows";

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
          aria-label="Top 10 carousel"
        >
          <div className="flex gap-6">
            {renderItems.map((item, index) => {
              const itemTitle = item.title || item.name || "Untitled";
              const backdropPath = item.backdrop_path || "";
              const rank = index + 1;

              return (
                <div
                  key={item.id}
                  className="flex-[0_0_calc(50%-12px)] sm:flex-[0_0_calc(33.333%-16px)] lg:flex-[0_0_calc(25%-18px)] min-w-0 shrink-0"
                >
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
                            WebkitTextStroke: "1px var(--stroke-color)",
                            paintOrder: "stroke fill",
                          }}
                        >
                          {rank}
                        </span>

                        <div
                          className="w-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950
                            rounded-2xl border border-gray-400/30 overflow-hidden shadow-lg
                            hover:shadow-xl hover:scale-103 hover:border-accent-primary/75
                            transition-all duration-300 relative cursor-pointer"
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
                            priority={false}
                          />

                          {/* Hover gradient overlay with title */}
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="text-sm font-semibold text-white truncate">
                              {itemTitle}
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

        {prevBtnEnabled && (
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-0 inset-y-0 z-10 hidden lg:flex w-20 items-center justify-start pl-2
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
        {nextBtnEnabled && (
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-0 inset-y-0 z-10 hidden lg:flex w-20 items-center justify-end pr-2
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

        <div className="">
          <div className="flex items-center justify-center gap-2">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === selectedIndex ? "bg-sky-500 w-6" : "bg-gray-500/50 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
