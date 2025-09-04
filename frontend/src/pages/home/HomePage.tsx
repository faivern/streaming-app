import { useState } from "react";
import MediaTypeToggle from "../../components/media/grid/MediaTypeToggle";
import MediaGrid from "../../components/media/grid/MediaGrid";
import HeroSection from "../../components/media/hero/HeroSection";
import GenreCardList from "../../components/media/carousel/GenreCardList";
import CollectionCarousel from "../../components/media/carousel/CollectionCarousel";
import TrendingCarousel from "../../components/media/carousel/TrendingCarousel";

import Error from "../../components/feedback/Error";
import Loading from "../../components/feedback/Loading";

import { sumDiscoverMedia } from "../../utils/sumDiscoverMedia";
import { useTrendingMedia } from "../../hooks/trending/useTrendingMedia";
import { useDiscoverMovies, useDiscoverTv } from "../../hooks/discover/useDiscover";
import { useGenres } from "../../hooks/genres/useGenres";
import { useFeaturedCollections } from "../../hooks/collections/useCollections";
import { featuredCollections } from "../../utils/featuredCollections";

export default function HomePage() {
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [error, setError] = useState(false);
  
  const { data: featured = [], isLoading } = useFeaturedCollections(featuredCollections);
  const { data: trending = [], isLoading: trendingLoading } = useTrendingMedia("all", "day");
  const { data: movies, isLoading: moviesLoading } = useDiscoverMovies();
  const { data: tv, isLoading: tvLoading } = useDiscoverTv();
  const { data: genres = [], isLoading: genresLoading } = useGenres();
  
  const totalMedia = sumDiscoverMedia(movies, tv);

  const pageLoading = moviesLoading || tvLoading || trendingLoading || isLoading || genresLoading;

  if (pageLoading) {
    return (
      <Loading />
    );
  }
  
  if (error) {
    return (
      <Error />
    );
  }
  
  return (
    <main className="mt-20 md:mt-24 lg:mt-28 xl:mt-32">
      <TrendingCarousel items={trending} loading={trendingLoading} />
      <HeroSection total_results={totalMedia} />
      <MediaTypeToggle selectedType={mediaType} onToggle={setMediaType} />
      <MediaGrid key={mediaType} media_type={mediaType} />
      <GenreCardList genres={genres} />
      <CollectionCarousel items={featured} loading={isLoading} />
    </main>
  );
}