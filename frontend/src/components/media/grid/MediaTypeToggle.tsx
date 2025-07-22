import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTv, faFilm } from "@fortawesome/free-solid-svg-icons";
type MediaType = "movie" | "tv";

type MediaTypeToggleProps = {
  selectedType: MediaType;
  onToggle: (type: MediaType) => void;
};

export default function MediaTypeToggle({
  selectedType,
  onToggle,
}: MediaTypeToggleProps) {
  return (
    <div className="flex justify-center gap-4 mb-6">
      <button
        className={`px-4 py-2 rounded text-white font-semibold transition-colors hover:cursor-pointer
          ${selectedType === "movie" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
        onClick={() => onToggle("movie")}
      >
        <FontAwesomeIcon icon={faFilm} className="mr-2" />
        Movies
      </button>
      <button
        className={`px-4 py-2 rounded text-white font-semibold transition-colors hover:cursor-pointer
          ${selectedType === "tv" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
        onClick={() => onToggle("tv")}
      >
        <FontAwesomeIcon icon={faTv} className="mr-2" />
        TV Shows
      </button>
    </div>
  );
}
