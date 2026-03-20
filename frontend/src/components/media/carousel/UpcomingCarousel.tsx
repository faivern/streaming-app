import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { TrendingMedia } from "../../../types/tmdb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Plus } from "lucide-react";
import TitleMid from "../title/TitleMid.tsx";
import Poster from "../shared/Poster";
import RatingPill from "../../ui/RatingPill";
import AddToListModal from "../../lists/modals/AddToListModal";
import { useSortChronological } from "../../../hooks/sorting/useSortChronological.ts";
import { usePreloadImages } from "../../../hooks/images/usePreloadImages";
import { useUser } from "../../../hooks/user/useUser";
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
  const { data: user } = useUser();
  const [addToListMedia, setAddToListMedia] = useState<TrendingMedia | null>(null);

  const releaseDateSort = useSortChronological(items);

  const posterUrls = useMemo(
    () =>
      releaseDateSort
        .filter((m) => m.poster_path)
        .map((m) => `https://image.tmdb.org/t/p/w342${m.poster_path}`),
    [releaseDateSort]
  );
  usePreloadImages(posterUrls);

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

  const [selectedSnap, setSelectedSnap] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedSnap(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("init", onSelect);
    onSelect();
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
          <div className="flex gap-4">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-[0_0_calc(100%/2-8px)] sm:flex-[0_0_calc(100%/3-10.67px)] md:flex-[0_0_calc(100%/4-12px)] lg:flex-[0_0_calc(100%/5-12.8px)] xl:flex-[0_0_calc(100%/6-13.34px)] 2xl:flex-[0_0_calc(100%/7-13.72px)] 3xl:flex-[0_0_calc(100%/8-14px)] 4xl:flex-[0_0_calc(100%/9-14.22px)] min-w-0 shrink-0"
                  >
                    <div className="aspect-[2/3] rounded-2xl bg-white/10 animate-pulse" />
                  </div>
                ))
              : releaseDateSort.map((item, index) => {
                  const itemTitle = item.title || item.name || "Untitled";
                  const releaseDate =
                    mediaType === "movie"
                      ? item.release_date
                      : item.first_air_date;
                  const posterPath = item.poster_path || "";
                  const shouldPrioritize = index < 5;

                  return (
                    <div
                      key={item.id}
                      className="flex-[0_0_calc(100%/2-8px)] sm:flex-[0_0_calc(100%/3-10.67px)] md:flex-[0_0_calc(100%/4-12px)] lg:flex-[0_0_calc(100%/5-12.8px)] xl:flex-[0_0_calc(100%/6-13.34px)] 2xl:flex-[0_0_calc(100%/7-13.72px)] 3xl:flex-[0_0_calc(100%/8-14px)] 4xl:flex-[0_0_calc(100%/9-14.22px)] min-w-0 shrink-0"
                    >
                      <Link to={`/media/${mediaType}/${item.id}`}>
                        <div className="group cursor-pointer">
                          <div
                            className="bg-[var(--component-primary)]
                              rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg
                              hover:shadow-xl hover:scale-103 hover:border-accent-primary/75
                              transition-all duration-300 relative"
                          >
                            <RatingPill
                              rating={item.vote_average}
                              className="absolute top-2 right-2 z-10 bg-badge-primary/40 backdrop-blur-sm border-badge-foreground/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              showOutOfTen={false}
                            />
                            {user && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setAddToListMedia(item);
                                }}
                                aria-label="Add to list"
                                className="absolute top-1 left-1 z-10 p-3 rounded-xl bg-primary/40 border border-badge-foreground/40 backdrop-blur-sm text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-primary/70 hover:border-accent-primary/75 transition-all duration-300 cursor-pointer"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            )}
                            <Poster
                              path={posterPath}
                              alt={itemTitle}
                              className="w-full"
                              priority={shouldPrioritize}
                            />
                            {/* Desktop-only: title on hover inside card */}
                            <div className="hidden lg:block absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <h3 className="text-sm font-semibold text-white truncate">
                                {itemTitle}
                              </h3>
                            </div>
                          </div>
                          <div className="px-1 mt-1">
                            <div className="flex items-center gap-1.5 text-xs text-accent-primary">
                              <FontAwesomeIcon
                                icon={faCalendar}
                                className="text-accent-secondary text-[10px]"
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

        {scrollSnaps.length > 0 && (
          <div className="hidden lg:block">
            <div className="flex items-center justify-center gap-2">
              {scrollSnaps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === selectedSnap ? "bg-accent-primary w-6" : "bg-[var(--outline)] w-2"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {addToListMedia && (
        <AddToListModal
          isOpen={!!addToListMedia}
          onClose={() => setAddToListMedia(null)}
          media={{
            tmdbId: addToListMedia.id,
            mediaType,
            title: addToListMedia.title || addToListMedia.name || "Untitled",
            posterPath: addToListMedia.poster_path ?? null,
            overview: addToListMedia.overview ?? null,
            voteAverage: addToListMedia.vote_average ?? null,
          }}
        />
      )}
    </section>
  );
}
