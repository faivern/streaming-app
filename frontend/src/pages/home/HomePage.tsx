import { useEffect, useState } from "react";
import MediaTypeToggle from "../../components/media/grid/MediaTypeToggle";
import MediaGrid from "../../components/media/grid/MediaGrid";
import Carousel from "../../components/media/carousel/TrendingCarousel";
import HeroSection from "../../components/media/hero/HeroSection";
import { sumDiscoverMedia } from "../../utils/sumDiscoverMedia";
import GenreCardList from "../../components/media/carousel/GenreCardList";
import CollectionCarousel from "../../components/media/carousel/CollectionCarousel";

import { getDiscoverMovies, getDiscoverTv } from "../../api/discover.api";
import { getMovieGenres, getTvGenres } from "../../api/genres.api";

export default function HomePage() {
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [movieData, setMovieData] = useState<any>({});
  const [tvData, setTvData] = useState<any>({});
  const [genres, setGenres] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const [movieRes, tvRes, movieGenres, tvGenres] = await Promise.all([
          getDiscoverMovies(),
          getDiscoverTv(),
          getMovieGenres(),
          getTvGenres(),
        ]);

        setMovieData(movieRes ?? {});
        setTvData(tvRes ?? {});
        setGenres([...movieGenres ?? [], ...tvGenres ?? []]);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
    // empty deps: fetch once on mount
  }, []);

  const totalMedia = sumDiscoverMedia(movieData, tvData);

  if (loading) {
    return (
      <main className="mt-20 md:mt-24 lg:mt-28 xl:mt-32">
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mt-20 md:mt-24 lg:mt-28 xl:mt-32">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-xl">Error loading data</div>
        </div>
      </main>
    );
  }

  return (
    <main className="mt-20 md:mt-24 lg:mt-28 xl:mt-32">
      <Carousel />
      <HeroSection total_results={totalMedia} />
      <MediaTypeToggle selectedType={mediaType} onToggle={setMediaType} />
      <MediaGrid key={mediaType} media_type={mediaType} />
      <GenreCardList genres={genres} />
      <CollectionCarousel />
    </main>
  );
}