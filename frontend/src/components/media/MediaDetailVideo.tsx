import { FaPlay } from "react-icons/fa";
import { useEffect, useState } from "react";

type Props = {
  backdrop_path: string;
  isPlaying?: boolean;
  onPlay?: () => void;
};

export default function MediaDetailVideo({ backdrop_path, isPlaying: externalIsPlaying, onPlay }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Update internal state when external state changes
  useEffect(() => {
    if (externalIsPlaying) {
      setIsPlaying(true);
    }
  }, [externalIsPlaying]);

  const handlePlayClick = () => {
    console.log("video playing");
    setIsPlaying(true);
    onPlay?.();
  };

  return (
    <div className="relative m-4 overflow-hidden rounded-lg shadow-md group max-w-6xl mx-auto">
      {/* Placeholder Backdrop */}
      {!isPlaying ? (
        <img
          loading="lazy"
          src={`https://image.tmdb.org/t/p/w1280${backdrop_path}`}
          alt="Backdrop"
          className="rounded-lg shadow-inner w-full h-auto transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <iframe 
          src="https://www.youtube.com/embed/7H8kDHEiuKU?autoplay=1" 
          className="w-full h-auto rounded-lg aspect-video"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      )}

      {!isPlaying && (
        <>
          <div className="absolute inset-0 backdrop-blur bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
            <div 
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-black p-4 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 animate-pulse"
              role="button"
              onClick={handlePlayClick}
            >
              <FaPlay className="text-xl"/>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
