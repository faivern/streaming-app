import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTv, faFilm } from "@fortawesome/free-solid-svg-icons";
import "../../../style/TitleHover.css";

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
<div className="flex justify-center space-x-8 text-lg font-semibold mb-6">
  <button
    onClick={() => onToggle("movie")}
    className={`pb-1 transition-colors duration-300 ${
      selectedType === "movie"
        ? "text-white cursor-default"
        : "text-gray-400 hover:text-white cursor-pointer"
    }`}
  >
    <span className={`underline-hover ${selectedType === "movie" ? "active" : ""}`}>
      Movies
      <span className="underline-bar"></span>
    </span>
  </button>

  <button
    onClick={() => onToggle("tv")}
    className={`pb-1 transition-colors duration-300 ${
      selectedType === "tv"
        ? "text-white cursor-default"
        : "text-gray-400 hover:text-white cursor-pointer"
    }`}
  >
    <span className={`underline-hover ${selectedType === "tv" ? "active" : ""}`}>
      TV Shows
      <span className="underline-bar"></span>
    </span>
  </button>
</div>

  );
}
