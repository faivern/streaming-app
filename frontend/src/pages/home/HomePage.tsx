import { useEffect, useState } from "react";
import MediaTypeToggle from "../../components/media/grid/MediaTypeToggle";
import MediaGrid from "../../components/media/grid/MediaGrid";
import Carousel from "../../components/media/carousel/TrendingCarousel";
import HeroSection from "../../components/media/hero/HeroSection";
import { sumDiscoverMedia } from "../../utils/sumDiscoverMedia";
import axios from "axios";

export default function HomePage() {
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [movieData, setMovieData] = useState<any>({});
  const [tvData, setTvData] = useState<any>({});

  useEffect(() => {
    const fetchTotalData = async () => {
      try {
        setLoading(true);
        
        // Fetch both movie and TV data for the total count
        const [movieRes, tvRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/Movies/discover/movie`),
          axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/Movies/discover/tv`)
        ]);

        setMovieData(movieRes.data || {});
        setTvData(tvRes.data || {});

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalData();
  }, []); // Remove mediaType dependency since we want to fetch both always

  // Calculate total using your utility function
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
      
      {/* Content with matching background and slight overlap */}
        <HeroSection 
          total_results={totalMedia}
        />
        <MediaTypeToggle selectedType={mediaType} onToggle={setMediaType} />
        <MediaGrid media_type={mediaType} />
    </main>
  );
}

