// components/media/modals/MediaCardModal.tsx
import { Link } from "react-router-dom";
import { useFloating } from "@floating-ui/react";
import { useMediaDetail } from "../../../hooks/media/useMediaDetail";
import genreMap from "../../../utils/genreMap";
import languageMap from "../../../utils/languageMap";
import { dateFormat } from "../../../utils/dateFormat";
import type { DetailMedia, MediaType } from "../../../types/tmdb";
import { useVideo } from "../../../hooks/useVideo";

type InitialBits = Pick<DetailMedia,
  "poster_path" | "backdrop_path" | "overview" | "vote_average" | "vote_count" | "genre_ids" | "original_language" | "runtime" | "number_of_seasons" | "number_of_episodes" | "title" | "name" | "release_date" | "first_air_date"
>;

type MediaCardModalProps = {
  id: number;
  media_type: MediaType;
  initial?: InitialBits; // optional tiny payload for instant UI
};

const MediaCardModal = ({ id, media_type, initial }: MediaCardModalProps) => {
  const { refs } = useFloating();
  const { data, isLoading } = useMediaDetail(media_type, id, initial);
  const title = data?.title ?? data?.name ?? initial?.title ?? initial?.name ?? "Loading…";

  // trailer uses the correct type now (was hardcoded "movie")
  const { videoUrl, loading: trailerLoading } = useVideo(media_type, id);

  const release = data?.release_date ?? data?.first_air_date ?? initial?.release_date ?? initial?.first_air_date;
  const overview = data?.overview ?? initial?.overview ?? "No description";
  const poster = data?.backdrop_path ?? initial?.backdrop_path ?? data?.poster_path ?? initial?.poster_path;
  const voteAvg = data?.vote_average ?? initial?.vote_average;
  const voteCount = data?.vote_count ?? initial?.vote_count;
  const lang = data?.original_language ?? initial?.original_language ?? "en";
  const genres = data?.genre_ids ?? initial?.genre_ids ?? data?.genres?.map(g => g.id);

  // runtime: movies vs tv
  const runtimeMin =
    typeof (data as any)?.runtime === "number"
      ? (data as any).runtime
      : Array.isArray((data as any)?.episode_run_time) && (data as any).episode_run_time[0];

  const seasons = (data as any)?.number_of_seasons;
  const episodes = (data as any)?.number_of_episodes;

  return (
    <Link to={`/media/${media_type}/${id}`}>
      <div ref={refs.setFloating} className="backdrop-blur-md bg-gray-900/80 min-w-96 p-4 shadow-2xl rounded-lg border border-gray-600/70 text-white">
        <h2 className="text-xl font-bold mb-2 text-gray-100">{title}</h2>

        {/* Trailer / image */}
        {trailerLoading ? (
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
        ) : poster ? (
          <div className="aspect-video w-full rounded-lg overflow-hidden mb-3">
            <img
              src={`https://image.tmdb.org/t/p/w500${poster}`}
              alt={title}
              className="w-full h-48 object-cover object-center rounded mb-2"
            />
          </div>
        ) : null}

        <p className="text-sm text-gray-200 mb-2 line-clamp-4">{overview}</p>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700/70 to-transparent mb-2" />

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-gray-300">
          <div>
            <strong>Release Date</strong>
            <div>{dateFormat(release) || "No date"}</div>
          </div>

          <div>
            <strong>IMDb</strong>
            <div>
              {voteAvg?.toFixed?.(1) ?? "No rating"}/10{voteCount ? ` by ${voteCount.toLocaleString()} reviews` : ""}
            </div>
          </div>

          <div>
            <strong>Language</strong>
            <div>{languageMap[lang] ?? lang.toUpperCase()}</div>
          </div>

          <div>
            <strong>Genres</strong>
            <div>
              {Array.isArray(genres) &&
                genres.map((gid: number, idx) => (
                  <span key={gid}>
                    {genreMap[gid] || "Genre Unknown"}
                    {idx !== genres.length - 1 && ", "}
                  </span>
                ))}
            </div>
          </div>

          <div className="col-span-2">
            <strong>Runtime</strong>
            <div className="mt-1 text-white">
              {media_type === "movie" && typeof runtimeMin === "number"
                ? `${Math.floor(runtimeMin / 60)}h ${runtimeMin % 60}min`
                : media_type === "tv"
                ? `${seasons ?? "?"} Season${seasons === 1 ? "" : "s"} • ${episodes ?? "?"} Episode${episodes === 1 ? "" : "s"}`
                : "Unknown"}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MediaCardModal;
