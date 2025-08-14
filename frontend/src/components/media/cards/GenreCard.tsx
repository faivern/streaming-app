import { Link } from "react-router-dom";
import "../../../style/MediaCard.css";
import { getGenreColor } from "../../../theme/genreColors";

type Genre = {
  id: number;
  name: string;
};

const GenreCard = ({ id, name }: Genre) => {
  return (
    <div
      className={`group relative h-48 rounded-lg overflow-hidden 
                 ${getGenreColor(id)} border border-gray-400/70 shadow-lg 
                 transition-transform duration-300 hover:scale-105`}
    >
      <Link
        to={`/genre/${id}?mediaType=movie&name=${encodeURIComponent(name)}`}
        className="block h-full w-full"
      >
        {/* Optional subtle overlay tint */}
        <div className="absolute inset-0 bg-black/10" />

        {/* Shine overlay (uses .group:hover .shine-overlay from MediaCard.css) */}
        <span className="shine-overlay" />

        {/* Content */}
        <div className="relative z-10 h-full w-full flex items-center justify-center text-center">
          <h3 className="text-3xl font-semibold text-white text-shadow-lg">
            {name}
          </h3>
        </div>
      </Link>
    </div>
  );
};

export default GenreCard;
