// components/media/modals/MediaCardModal.tsx
import { Link } from "react-router-dom";
import { useFloating } from "@floating-ui/react";
import { useMediaDetail } from "../../../hooks/media/useMediaDetail";
import genreMap from "../../../utils/genreMap";
import languageMap from "../../../utils/languageMap";
import { Calendar, Clock, Globe } from "lucide-react";
import { dateFormat } from "../../../utils/dateFormat";
import type { DetailMedia, MediaType } from "../../../types/tmdb";
import useMediaRuntime from "../../../hooks/media/useMediaRuntime";

type InitialBits = Pick<
  DetailMedia,
  | "poster_path"
  | "backdrop_path"
  | "overview"
  | "genre_ids"
  | "original_language"
  | "runtime"
  | "number_of_seasons"
  | "number_of_episodes"
  | "title"
  | "name"
  | "release_date"
  | "first_air_date"
>;

type MediaCardModalProps = {
  id: number;
  title: string;
  backdrop?: string;
  overview?: string;
  releaseDate?: string;
  genre_ids?: number[];
  original_language?: string;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  media_type: MediaType;
  initial?: InitialBits; // optional tiny payload for instant UI
};

const MediaCardModal = ({ id, media_type, initial }: MediaCardModalProps) => {
  const { refs } = useFloating();
  const { data } = useMediaDetail(media_type, id, initial);
  const title =
    data?.title ?? data?.name ?? initial?.title ?? initial?.name ?? "Loading…";

  const release =
    data?.release_date ??
    data?.first_air_date ??
    initial?.release_date ??
    initial?.first_air_date;
  const overview = data?.overview ?? initial?.overview ?? "No description";
  const poster =
    data?.backdrop_path ??
    initial?.backdrop_path ??
    data?.poster_path ??
    initial?.poster_path;
  const lang = data?.original_language ?? initial?.original_language ?? "en";
  const genres =
    data?.genre_ids ?? initial?.genre_ids ?? data?.genres?.map((g) => g.id);

  // runtime: movies vs tv
  const runtimeMin =
    typeof (data as any)?.runtime === "number"
      ? (data as any).runtime
      : Array.isArray((data as any)?.episode_run_time) &&
        (data as any).episode_run_time[0];

  const seasons = (data as any)?.number_of_seasons;
  const episodes = (data as any)?.number_of_episodes;

  const runtimeDisplay = useMediaRuntime({
    mediaType: media_type,
    runtimeMin,
    seasons,
    episodes,
  });

  return (
    <Link to={`/media/${media_type}/${id}`}>
      <div
        ref={refs.setFloating}
        className="backdrop-blur-md bg-gray-900/80 w-full max-w-lg p-3 shadow-2xl rounded-lg border border-gray-600/70 text-white"
      >
        <h2 className="text-xl font-bold mb-2 text-gray-100">{title}</h2>

        {/* Backdrop image */}
        {poster && (
          <div className="aspect-video w-full rounded-lg overflow-hidden mb-3">
            <img
              src={`https://image.tmdb.org/t/p/w780${poster}`}
              srcSet={`https://image.tmdb.org/t/p/w300${poster} 300w, https://image.tmdb.org/t/p/w780${poster} 780w`}
              sizes="384px"
              loading="lazy"
              decoding="async"
              alt={title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}

        <p className="text-sm text-gray-200 mb-2 line-clamp-3">{overview}</p>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700/70 to-transparent mb-2" />

        <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-300">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {dateFormat(release) || "No date"}
          </span>
          <span className="text-gray-600">|</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {runtimeDisplay ?? "Unknown"}
          </span>
          <span className="text-gray-600">|</span>
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {languageMap[lang] ?? lang.toUpperCase()}
          </span>
        </div>

        {Array.isArray(genres) && genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {genres.slice(0, 4).map((gid: number) => (
              <span
                key={gid}
                className="px-2 py-0.5 text-xs rounded-full bg-gray-700/60 text-gray-300 border border-gray-600/40"
              >
                {genreMap[gid] || "Unknown"}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default MediaCardModal;
