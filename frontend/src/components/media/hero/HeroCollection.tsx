import Backdrop from "../shared/Backdrop";
import Poster from "../shared/Poster";
import { avgCollectionRating } from "../../../utils/avgCollectionRating";
import { firstLastRelease } from "../../../utils/firstLastRelease";
import { countMovies } from "../../../utils/countMovies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { dateFormatYear } from "../../../utils/dateFormatYear";
import { Clock, Calendar, Clapperboard } from "lucide-react";
import Pill from "../../ui/Pill";

type CollectionPart = {
  id?: number;
  vote_average?: number;
  release_date?: string;
  // Add any other properties you need
};

type Props = {
  collection: {
    name: string;
    overview?: string;
    backdrop_path?: string;
    poster_path?: string;
    vote_average?: number;
    parts?: Array<CollectionPart>;
  };
};

const HeroCollection = ({ collection }: Props) => {
  let avgRating = avgCollectionRating(collection.parts);
  let firstRelease = firstLastRelease(collection.parts).first;
  let lastRelease = firstLastRelease(collection.parts).last;
  let movieCount = countMovies(collection.parts);
  let collectionOverview = collection.overview;

  return (
    <section className="relative overflow-hidden rounded-xl border border-[var(--border)] shadow-lg mb-6">
      <Backdrop
        path={collection.backdrop_path || collection.poster_path || ""}
        alt={collection.name}
        className="w-full h-64 md:h-80 lg:h-96 object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{collection.name}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--subtle)] mt-3">
          <Pill
            icon={<FontAwesomeIcon icon={faStar} className="text-amber-400" />}
            title="Average TMDB Rating"
            className="font-medium"
          >
            {avgRating ? (
              <>
                <span className="font-bold">{avgRating}</span>
                <span>/10</span>
              </>
            ) : (
              "No rating"
            )}
          </Pill>

          <Pill
            icon={<Calendar className="h-4 w-4" />}
            title="Release Dates"
          >
            {firstRelease}
            {" - "}
            {lastRelease}
          </Pill>

          <Pill
            icon={<Clapperboard className="h-4 w-4" />}
            title="Total Movies"
          >
            Movies: {movieCount}
          </Pill>
        </div>
        <p className="mt-2 text-[var(--subtle)] line-clamp-3 sm:line-clamp-none">{collectionOverview}</p>
      </div>
    </section>
  );
};
export default HeroCollection;
