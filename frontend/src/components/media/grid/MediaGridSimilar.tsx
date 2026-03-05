// components/media/grid/MediaGridSimilar.tsx
import MediaCard from "../cards/MediaCard";
import MediaSimilarCard from "../cards/MediaSimilarCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import type { DetailMedia, MediaType } from "../../../types/tmdb";
import TitleMid from "../title/TitleMid";

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
    <aside className="shadow-lg block">
      <div className="bg-component-primary rounded-xl p-4 border border-accent-foreground/60 overflow-visible">
        <TitleMid className="">
          You may like
        </TitleMid>

        <div className="relative">
          <div className="flex overflow-x-auto scroll-smooth scrollbar-none gap-3 md:grid md:grid-cols-1 md:gap-2 md:overflow-visible">
            {similarMedia.slice(start, end).map((m) => {
              const mt: MediaType = (m.media_type as MediaType) ?? parentType ?? inferType(m);
              const displayTitle = m.title ?? m.name ?? "Unknown Title";
              return (
                <div key={`${m.id}-${mt}`} className="flex-shrink-0 md:flex-shrink">
                  {/* Mobile: full poster card */}
                  <div className="md:hidden w-36">
                    <MediaCard
                      id={m.id}
                      media_type={mt}
                      title={displayTitle}
                      posterPath={m.poster_path ?? ""}
                      overview={m.overview}
                      releaseDate={m.release_date ?? m.first_air_date}
                      vote_average={m.vote_average}
                      genre_ids={m.genre_ids}
                      original_language={m.original_language}
                      runtime={m.runtime}
                      number_of_seasons={m.number_of_seasons}
                      number_of_episodes={m.number_of_episodes}
                      disableHoverModal
                    />
                  </div>
                  {/* Desktop: compact sidebar card */}
                  <div className="hidden md:block">
                    <MediaSimilarCard
                      id={m.id}
                      media_type={mt}
                      title={displayTitle}
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
                      runtime={m.runtime}
                      number_of_seasons={m.number_of_seasons}
                      number_of_episodes={m.number_of_episodes}
                    />
                  </div>
                </div>
              );
            })}

            {!similarMedia.length && (
              <p className="text-gray-400 text-sm text-center py-4">
                No similar titles found
              </p>
            )}
          </div>
          {/* Right-edge fade for mobile horizontal scroll */}
          <div
            className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--component-primary)] to-transparent pointer-events-none md:hidden"
            aria-hidden="true"
          />
        </div>
      </div>
    </aside>
  );
};

export default MediaGridSimilar;
