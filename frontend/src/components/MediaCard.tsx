import TiltWrapper from "./TiltWrapper";
import "../style/MediaCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import MediaCardModal from "./modals/MediaCardModal";
import { useState, useRef, useEffect } from "react";

type MediaCardProps ={
  id: number;
  title: string;
  posterPath: string;
  overview?: string;
  releaseDate?: string;
  vote_average?: number;
}

export default function MediaCard({
  id,
  title,
  posterPath,
  overview,
  releaseDate,
  vote_average,
}: MediaCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hovered && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const modalWidth = 320;
      const spaceRight = window.innerWidth - rect.right;
      setShowLeft(spaceRight < modalWidth);
    }
  }, [hovered]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={cardRef}
    >
      <div className="group relative z-10 hover:z-30 transition-transform duration-300">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 
            rounded-lg border border-gray-600/30 overflow-hidden shadow-md 
            hover:shadow-lg hover:cursor-pointer relative transition-all hover:scale-101">
          
          {/* Shine layer */}
          <div className="shine-overlay" />

          {/* Release date tag */}
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-20">
            {releaseDate?.split("-")[0] ?? "N/A"}
          </div>

          {/* Poster */}
          <img
            loading="lazy"
            src={`https://image.tmdb.org/t/p/w500${posterPath}`}
            alt={title}
            className="w-full h-128 object-cover"
          />

          {/* Content */}
          <div className="p-4 flex flex-wrap gap-4 items-center justify-between">
            <h3 className="text-md font-semibold text-white truncate">
              {title.length > 20 ? `${title.slice(0, 20)}...` : title}
            </h3>
            <p className="text-md font-medium bg-gray-800/55 text-gray-300 px-3 py-1 rounded-full">
              <FontAwesomeIcon icon={faStar} className="mr-1 text-amber-400" />
              {vote_average !== undefined
                ? ` ${vote_average.toFixed(1)} / 10`
                : "No rating"}
            </p>
          </div>
        </div>
        {/* 🟡 Simple test modal */}
        {hovered && (
          <div
            className={`absolute top-0 z-50 ${showLeft ? "right-full" : "left-full"}`}
          >
            <MediaCardModal
                  title={title}
                  backdrop={posterPath}
                  overview={overview}
                  releaseDate={releaseDate}
                  vote_average={vote_average}
                  genreIds={[]} // Assuming genreIds is not used here, you can pass an empty array
            />
          </div>
        )}
      </div>
    </div>
  );
}
