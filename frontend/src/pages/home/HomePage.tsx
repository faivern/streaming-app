import { useState, useEffect } from "react";
import MediaTypeToggle from "../../components/media/grid/MediaTypeToggle";
import MediaGrid from "../../components/media/grid/MediaGrid";
import HeroSection from "../../components/media/hero/HeroSection";
import GenreCardList from "../../components/media/carousel/GenreCardList";
import CollectionCarousel from "../../components/media/carousel/CollectionCarousel";
import TrendingCarousel from "../../components/media/carousel/TrendingCarousel";
import UpcomingCarousel from "../../components/media/carousel/UpcomingCarousel";
import Top10Carousel from "../../components/media/carousel/Top10Carousel";
import WatchProviderCarousel from "../../components/media/carousel/WatchProviderCarousel";

import Loading from "../../components/feedback/Loading";

import { sumDiscoverMedia } from "../../utils/sumDiscoverMedia";
import { useTrendingMedia } from "../../hooks/trending/useTrendingMedia";
import {
  useDiscoverMovies,
  useDiscoverTv,
} from "../../hooks/discover/useDiscover";
import { useGenresWithBackdrops } from "../../hooks/genres/useGenresWithBackdrops";
import { useFeaturedCollections } from "../../hooks/collections/useCollections";
import { useUpcomingMedia } from "../../hooks/upcoming/useUpcomingMedia";
import { useTopRatedMedia } from "../../hooks/toprated/useTopRatedMedia";
import { useSortByBayesian } from "../../hooks/sorting/useSortByBayesian";
import { featuredCollections } from "../../utils/featuredCollections";
import useMediaGrid from "../../hooks/media/useMediaGrid";
import { useWatchProvidersList } from "../../hooks/media/useWatchProvidersList";
import { getDefaultCountry } from "../../components/media/RegionSelector";

export default function HomePage() {
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");

  const { data: featured = [], isLoading } =
    useFeaturedCollections(featuredCollections);
  const { data: trending = [], isLoading: trendingLoading } = useTrendingMedia(
    "all",
    "day"
  );
  const { data: movies, isLoading: moviesLoading } = useDiscoverMovies();
  const { data: tv, isLoading: tvLoading } = useDiscoverTv();
  const { data: genres = [], isLoading: genresLoading } = useGenresWithBackdrops();
  const { data: upcoming = [], isLoading: upcomingLoading } =
    useUpcomingMedia(mediaType);
const { data: topRatedRaw = [], isLoading: topRatedLoading } =
  useTopRatedMedia(mediaType);
const topRated = useSortByBayesian(topRatedRaw);

  // Watch providers for the carousel
  const providerRegion = getDefaultCountry();
  const { data: watchProviders = [], isLoading: providersLoading } =
    useWatchProvidersList(providerRegion);

  // Use the new MediaGrid hook
  const {
    items: mediaItems,
    loading: mediaLoading,
    error: mediaError,
    fetchMediaGrid,
  } = useMediaGrid();

  // Fetch media grid data when mediaType changes
  useEffect(() => {
    fetchMediaGrid(mediaType);
  }, [mediaType, fetchMediaGrid]);

  const totalMedia = sumDiscoverMedia(movies, tv);

  const pageLoading =
    moviesLoading || tvLoading || trendingLoading || isLoading || genresLoading;

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <main className="mt-navbar-offset">
      {/* Hero carousel - full bleed for cinematic effect */}
      <TrendingCarousel items={trending} loading={trendingLoading} />

      {/* Main content container - caps width at 2560px for ultra-wide monitors */}
      <div className="mx-auto w-full max-w-screen-4xl">
        <HeroSection total_results={totalMedia} />
        <MediaTypeToggle selectedType={mediaType} onToggle={setMediaType} />
        <MediaGrid
          key={mediaType}
          media_type={mediaType}
          items={mediaItems}
          loading={mediaLoading}
          error={mediaError}
        />
        <Top10Carousel
          items={topRated}
          loading={topRatedLoading}
          mediaType={mediaType}
        />
        <GenreCardList genres={genres} />
        <WatchProviderCarousel
          providers={watchProviders}
          loading={providersLoading}
          region={providerRegion}
        />
        <CollectionCarousel items={featured} loading={isLoading} />
        <UpcomingCarousel
          items={upcoming}
          loading={upcomingLoading}
          mediaType={mediaType}
        />
      </div>
    </main>
  );
}
