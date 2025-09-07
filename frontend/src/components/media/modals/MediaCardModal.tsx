import genreMap from "../../../utils/genreMap";
import { useVideo } from "../../../hooks/useVideo";
import languageMap from "../../../utils/languageMap";
import { dateFormat } from "../../../utils/dateFormat";
import { Link } from "react-router-dom";

type MediaCardModalProps = {
  title: string;
  backdrop?: string;
  overview?: string;
  releaseDate?: string;
  vote_average?: number;
  genre_ids?: number[];
  id: number; // Add movieId prop to fetch video
  original_language?: string; // Default to English if not provided
  vote_count?: number; // Optional prop to display vote count
  runtime?: number; // Optional prop for movie length
  number_of_seasons?: number; // Optional prop for season number
  media_type?: string; // Optional prop to specify media type
  number_of_episodes?: number; // Optional prop for episode count
};

const MediaCardModal = ({
  title,
  overview,
  releaseDate,
  vote_average,
  backdrop,
  genre_ids,
  id,
  original_language = "en", // Default to English if not provided
  vote_count,
  runtime, // Optional prop for movie length
  number_of_seasons, // Optional prop for season number
  media_type,
  number_of_episodes, // Optional prop for episode count
}: MediaCardModalProps) => {
  const { videoUrl, loading } = useVideo("movie", id);
  console.log("genre_ids:", genre_ids);
  console.log("runtime:", runtime);
  return (
    <Link to={`/media/${media_type}/${id}`}>
      <div className="backdrop-blur-md bg-gray-900/80 min-w-96 p-4 shadow-2xl rounded-lg border-1 border-gray-600/70 text-white">
        <h2 className="text-xl font-bold mb-2 text-gray-100">{title}</h2>

        {loading ? (
          <p className="text-gray-400 mb-2">Loading trailer...</p>
        ) : videoUrl ? (
          <div className="aspect-video w-full rounded-lg overflow-hidden mb-3">
            <iframe
              src={videoUrl}
              title={`${title} Trailer`}
              className="w-full h-48 rounded mb-2"
              allow="autoplay; encrypted-media"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : backdrop ? (
          <div className="aspect-video w-full rounded-lg overflow-hidden mb-3">
            <img
              src={`https://image.tmdb.org/t/p/w500${backdrop}`}
              alt={title}
              className="w-full h-48 object-cover object-center rounded mb-2"
            />
          </div>
        ) : (
          <p className="text-gray-400 mb-2">No trailer available at id: {id}</p>
        )}
        <p className="text-sm text-gray-200 mb-2 line-clamp-4">
          {overview || "No description"}
        </p>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700/70 to-transparent mb-2"></div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-gray-300">
          <div>
            <strong>Release Date</strong>
            <div>{dateFormat(releaseDate) || "No date"}</div>
          </div>

          {/* TODO: add link to IMDb reviews*/}
          <div>
            <strong>IMDb</strong>
            <div>
              {vote_average?.toFixed(1) || "No rating"}/10 by{" "}
              {vote_count?.toLocaleString()} reviews
            </div>
          </div>

          <div>
            <strong>Language</strong>
            <div>
              {languageMap[original_language] ||
                original_language.toUpperCase()}
            </div>
          </div>

          <div>
            <strong>Genres</strong>
            <div>
              {Array.isArray(genre_ids) &&
                genre_ids.map((id: number, idx) => (
                  <span key={id}>
                    {genreMap[id] || "Genre Unknown"}
                    {genre_ids && idx !== genre_ids.length - 1 && ", "}
                  </span>
                ))}
            </div>
          </div>

          <div>
            {media_type === "movie" && (
              <div>
                <strong>Runtime</strong>
                <div>
                  {typeof runtime === "number"
                    ? `${Math.floor(runtime / 60)}h ${runtime % 60}min`
                    : "Unknown"}
                </div>
              </div>
            )}

            {media_type === "tv" && (
              <div className="col-span-2">
                <strong>Runtime</strong>
                <div className="mt-1 text-white">
                  {number_of_seasons ?? "?"} Season
                  {number_of_seasons === 1 ? "" : "s"}
                  {" • "}
                  {number_of_episodes ?? "?"} Episode
                  {number_of_episodes === 1 ? "" : "s"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MediaCardModal;
