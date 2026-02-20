// src/components/media/carousel/CollectionCarousel.tsx
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { Collection } from "../../../types/tmdb";
import CollectionCard from "../cards/CollectionCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TitleMid from "../title/TitleMid.tsx";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  items: Collection[];
  loading?: boolean;
};

export default function CollectionCarousel({ items, loading = false }: Props) {
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

  const renderItems = loading
    ? Array.from({ length: 8 }).map((_, i) => ({ id: i } as any))
    : items;

  return (
    <section className="px-6 sm:px-10 md:px-16 lg:px-20 xl:px-28 2xl:px-36 mt-8">
      <TitleMid>Collections</TitleMid>

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
          aria-label="Collections carousel"
        >
          <div className="flex gap-6">
            {renderItems.map((c: any) => (
              <div
                key={c.id}
                className="flex-[0_0_calc(50%-12px)] sm:flex-[0_0_calc(33.333%-16px)] lg:flex-[0_0_calc(25%-18px)] min-w-0 shrink-0"
              >
                {loading ? (
                  <div className="w-full aspect-video rounded-2xl bg-white/10 animate-pulse" />
                ) : (
                  <CollectionCard
                    id={c.id}
                    title={c.name}
                    backdrop_path={c.backdrop_path}
                    poster_path={c.poster_path}
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
