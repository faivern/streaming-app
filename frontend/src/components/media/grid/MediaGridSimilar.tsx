// components/media/grid/MediaGridSimilar.tsx
import MediaSimilarCard from "../cards/MediaSimilarCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import type { DetailMedia, MediaType } from "../../../types/tmdb";

type Props = {
  similarMedia: DetailMedia[];
  parentType: MediaType; // "movie" | "tv" from the current detail page
};

const MediaGridSimilar = ({ similarMedia, parentType }: Props) => {
  const start = 0, end = 8;

  // helper: infer type if TMDB item doesn't include it
  const inferType = (m: DetailMedia): MediaType =>
    (m.media_type as MediaType) ??
    (m.first_air_date ? "tv" : "movie"); // crude but works for TMDB

  return (
    <aside className="mt-8 shadow-lg w-md:max-w-6xl inline-block">
      <div className="bg-component-primary rounded-xl p-4 border border-accent-foreground/60 overflow-visible">
        <h2 className="text-xl font-semibold text-white mb-4">
          <FontAwesomeIcon icon={faPlay} className="text-md pr-2 text-accent-primary" />
          You may also like
        </h2>

        <div className="grid grid-cols-1 gap-2">
          {similarMedia.slice(start, end).map((m, index) => {
            const mt: MediaType = (m.media_type as MediaType) ?? parentType ?? inferType(m);
            return (
              <MediaSimilarCard
                key={`${m.id}-${mt}`}
                id={m.id}
                media_type={mt}
                title={m.title ?? m.name ?? "Unknown Title"}
                name={m.name}
                poster_path={m.poster_path ?? undefined}
                backdrop_path={m.backdrop_path ?? undefined}
                release_date={m.release_date}
                first_air_date={m.first_air_date}
                overview={m.overview}
                vote_average={m.vote_average}
                vote_count={m.vote_count}
                genre_ids={m.genre_ids}
                original_language={m.original_language}
                // optional row subtitle extras
                runtime={m.runtime}
                number_of_seasons={m.number_of_seasons}
                number_of_episodes={m.number_of_episodes}
              />
            );
          })}

          {!similarMedia.length && (
            <p className="text-gray-400 text-sm text-center py-4">
              No similar titles found
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default MediaGridSimilar;
