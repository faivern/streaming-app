import { useState } from "react";
import MediaTypeToggle from "../../components/media/grid/MediaTypeToggle";
import MediaGrid from "../../components/media/grid/MediaGrid";
import Carousel from "../../components/media/carousel/TrendingCarousel";
import Footer from "../../components/layout/Footer";

export default function HomePage() {
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");

  return (
    <main className="mt-20 md:mt-24 lg:mt-28 xl:mt-32">
      <Carousel />

      <MediaTypeToggle selectedType={mediaType} onToggle={setMediaType} />
      <MediaGrid media_type={mediaType} />
    </main>
  );
}
