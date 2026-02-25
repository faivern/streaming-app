import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import GenreCard from "../cards/GenreCard.tsx";
import "../../../style/TitleHover.css";
import TitleMid from "../title/TitleMid.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import type { EnrichedGenre } from "../../../types/tmdb";

type Props = {
  genres: EnrichedGenre[];
  loading?: boolean;
};

export default function GenreCardList({ genres, loading = false }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "start" });

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

  const renderItems = loading
    ? Array.from({ length: 8 }).map((_, i) => ({ id: i, name: "" } as any))
    : genres;

  if (!genres.length && !loading) return null;

  return (
    <section className="px-page mt-8">
      <TitleMid>Genres</TitleMid>

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
          aria-label="Genres carousel"
        >
          <div className="flex gap-6">
            {renderItems.map((genre: EnrichedGenre) => (
              <div
                key={genre.id}
                className="flex-[0_0_calc(50%-12px)] sm:flex-[0_0_calc(33.333%-16px)] md:flex-[0_0_calc(25%-18px)] lg:flex-[0_0_calc(20%-20px)] min-w-0 shrink-0"
              >
                {loading ? (
                  <div className="h-40 rounded-2xl bg-white/10 animate-pulse" />
                ) : (
                  <GenreCard
                    id={genre.id}
                    name={genre.name}
                    supportedMediaTypes={genre.supportedMediaTypes}
                    backdropPath={genre.backdropPath}
                  />
                )}
              </div>
            ))}
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
