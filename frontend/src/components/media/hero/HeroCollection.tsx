import Backdrop from "../shared/Backdrop";
import Poster from "../shared/Poster";
import { avgCollectionRating } from "../../../utils/avgCollectionRating";
import { firstLastRelease } from "../../../utils/firstLastRelease";
import { countMovies } from "../../../utils/countMovies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { dateFormatYear } from "../../../utils/dateFormatYear";
import { Clock, Calendar, Clapperboard } from "lucide-react";

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
    <section className="relative overflow-hidden rounded-xl border border-slate-600/30 shadow-lg mb-6">
      <Backdrop
        path={collection.backdrop_path || collection.poster_path || ""}
        alt={collection.name}
        className="w-full h-64 md:h-80 lg:h-96 object-cover"
      sizes="100vw"
      priority
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

    <div className="gap-4 absolute bottom-4 left-4 max-w-xl bg-gray-700/5 p-6 rounded-xl backdrop-blur-sm shadow-lg">
      <h1 className="text-3xl md:text-4xl font-bold">{collection.name}</h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-3">
        <p className="font-medium bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm flex items-center">
          <FontAwesomeIcon icon={faStar} className="text-amber-400 mr-1" />
          {avgRating ? (
            <>
              <span className="font-bold">{avgRating}</span>
              <span>/10</span>
            </>
          ) : (
            "No rating"
          )}
        </p>

        <p className="flex items-center gap-1 bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm">
          <Calendar className="h-4 w-4" />
          {firstRelease}
          {" - "}
          {lastRelease}
        </p>

        <p className="flex items-center gap-1 bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm">
          <Clapperboard className="h-4 w-4" />
          Total: {movieCount}
        </p>
      </div>
      <p className="mt-2 text-gray-300 max-w-3xl">{collectionOverview}</p>
    </div>
  </section>
);
}
export default HeroCollection;