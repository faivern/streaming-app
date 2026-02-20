import { useEffect, useState } from "react";
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
import useEmblaCarousel from "embla-carousel-react";

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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: true,
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

  const renderItems: WatchProviderListItem[] = loading
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
          ref={emblaRef}
          className="overflow-hidden py-3 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 rounded-lg"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
            if (e.key === "ArrowRight") emblaApi?.scrollNext();
          }}
          role="region"
          aria-label="Streaming services carousel"
        >
          <div className="flex gap-6">
            {renderItems.map((provider: WatchProviderListItem) => (
              <div
                key={provider.provider_id}
                className="flex-[0_0_calc(25%-18px)] sm:flex-[0_0_calc(20%-20px)] lg:flex-[0_0_calc(12.5%-21px)] min-w-0 shrink-0"
              >
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
      </div>
    </section>
  );
}
