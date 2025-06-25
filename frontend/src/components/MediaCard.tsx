import TiltWrapper from "./TiltWrapper";
import "../style/MediaCard.css";

export default function MediaCard({
  id,
  title,
  posterPath,
  overview,
  releaseDate,
}: MediaCardProps) {
  return (
    <TiltWrapper className="group relative z-10 hover:z-30 transition-transform duration-300">
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 
          rounded-lg border border-gray-600/30 overflow-hidden shadow-md 
          hover:shadow-lg hover:-translate-y-1 cursor-pointer relative transition-all">
        
        {/* Shine layer */}
        <div className="shine-overlay" />

        {/* Release date tag */}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-20">
          {releaseDate?.split("-")[0] ?? "N/A"}
        </div>

        {/* Poster */}
        <img
          src={`https://image.tmdb.org/t/p/w500${posterPath}`}
          alt={title}
          className="w-full h-128 object-cover rounded-t-lg"
        />

        {/* Content */}
        <div className="p-4">
          <h3 className="text-md font-semibold text-white truncate">{title}</h3>
          {/* Optional overview preview */}
          {/* <p className="text-gray-400 text-sm mt-2 line-clamp-2">{overview}</p> */}
        </div>
      </div>
    </TiltWrapper>
  );
}
