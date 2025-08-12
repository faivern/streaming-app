import "../../../style/MediaCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faBookmark } from "@fortawesome/free-solid-svg-icons";

import MediaCardModal from "../modals/MediaCardModal";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Poster from "../../media/shared/Poster";

type MediaCardProps = {
  id: number;
  title: string;
  posterPath: string;
  overview?: string;
  releaseDate?: string;
  vote_average?: number;
  genre_ids?: number[]; // Assuming genreIds is not used here, you can pass an empty array
  vote_count?: number; // Optional prop to display vote count
  original_language?: string; // Default to English if not provided
  runtime?: number; // Optional prop for movie length
  media_type?: string; // Optional prop to specify media type
  number_of_seasons?: number; // Optional prop for season number
  number_of_episodes?: number; // Optional prop for episode count
};

export default function MediaCard({
  id,
  title,
  posterPath,
  overview,
  releaseDate,
  vote_average,
  genre_ids,
  vote_count, // Optional prop to display vote count
  original_language, // Default to English if not provided
  runtime, // Optional prop for movie length
  media_type,
  number_of_seasons, // Optional prop for season number
  number_of_episodes, // Optional prop for episode count
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
      className="relative w-full max-w-[360px] mx-auto"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={cardRef}
    >
      <div className="group relative z-10 hover:z-30 transition-transform duration-300 cursor-pointer"></div>

      <div className="group relative z-10 hover:z-30 transition-transform duration-300 cursor-pointer">
        <div
          className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950
  rounded-xl border border-gray-700/30 overflow-hidden shadow-md
  hover:shadow-xl hover:scale-105 hover:border-blue-500/30 transition-all duration-300 relative group"
        >
          <Link to={`/media/${media_type}/${id}`}>
            {/* Shine layer */}
            <div className="shine-overlay" />

            {/* Bookmark button
          <div className="absolute top-2 left-2">
          <FontAwesomeIcon icon={faBookmark} />
          </div>
          */}

            <div
              className="absolute top-2 right-2 text-sm px-2 py-1 bg-gray-800/55 text-gray-300 rounded-full
          hover:scale-105 transition-all ease-in-out
          "
            >
              <FontAwesomeIcon icon={faStar} className="mr-1 text-amber-400" />
              {vote_average !== undefined
                ? ` ${vote_average.toFixed(1)}`
                : "No rating"}
            </div>
            {/* Poster */}
            <Poster path={posterPath} alt={title} className="w-full" />

            {/* Content */}
            <div className="p-4 flex flex-wrap gap-4 items-center justify-between">
              <h3 className="text-md font-semibold text-white truncate">
                {title.length > 35 ? `${title.slice(0, 35)}...` : title}
              </h3>
            </div>
          </Link>
        </div>
        {/* 🟡 Simple test modal */}
        {hovered && (
          <div
            className={`absolute top-0 z-50 ${
              showLeft ? "right-full" : "left-full"
            }`}
          >
            <MediaCardModal
              id={id}
              title={title}
              backdrop={posterPath}
              overview={overview}
              releaseDate={releaseDate}
              vote_average={vote_average}
              genre_ids={genre_ids ?? []} // Pass genre_ids from props, fallback to empty array
              vote_count={vote_count} // Pass vote_count from props
              original_language={original_language} // Pass original_language from props
              runtime={runtime} // Pass runtime from props
              number_of_seasons={number_of_seasons} // Pass season_number from props
              media_type={media_type} // Pass media_type from props
              number_of_episodes={number_of_episodes} // Pass number_of_episodes from props
            />
          </div>
        )}
      </div>
    </div>
  );
}
