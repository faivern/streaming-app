import MediaCastCard from "../cards/MediaCastCard.tsx";
import { Link, useParams } from "react-router-dom";
import "../../../style/TitleHover.css";
import type { Credit } from "../../../types/tmdb.ts";
import TitleMid from "../title/TitleMid.tsx";

type Props = {
  cast: Credit[];
};

const MediaCastCarousel = ({ cast }: Props) => {
  const { media_type, id } = useParams<{ media_type: string; id: string }>();

  const mediaCastStart = 0;
  const mediaCastEnd = 12;

  return (
    <section className="w-full py-4 px-4 md:px-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="[&>div]:mb-0">
          <TitleMid>Cast & Crew</TitleMid>
        </div>
        <Link to={`/media/${media_type}/${id}/credits`}>
          <span className="underline-hover text-gray-400">
            Explore all
            <span className="underline-bar"></span>
          </span>
        </Link>
      </div>

      <div
        className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-none lg:scrollbar px-2 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 rounded-lg"
        tabIndex={0}
        role="region"
        aria-label="Cast and crew carousel"
      >
        {cast.slice(mediaCastStart, mediaCastEnd).map((person) => (
          <MediaCastCard key={person.id} cast={person} />
        ))}
      </div>
    </section>
  );
};

export default MediaCastCarousel;
