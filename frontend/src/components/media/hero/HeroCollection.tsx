import Backdrop from "../shared/Backdrop";
import Poster from "../shared/Poster";
import { avgCollectionRating } from "../../../utils/avgCollectionRating";
import { firstLastRelease } from "../../../utils/firstLastRelease";
import { countMovies } from "../../../utils/countMovies";

type Props = {
  collection: {
    name: string;
    overview?: string;
    backdrop_path?: string;
    poster_path?: string;
    vote_average?: number;
    parts?: Array<{ vote_average?: number }>;
    parts?: Array<{ release_date?: string }>;
    parts?: Array<{ id?: number }>;
  };
};

const HeroCollection = ({ collection }: Props) => (
  <section className="relative overflow-hidden rounded-xl border border-slate-600/30 shadow-md mb-6">
    <Backdrop
      path={ collection.backdrop_path|| collection.poster_path || ""}
      alt={collection.name}
      className="w-full h-64 md:h-80 lg:h-96 object-cover"
      sizes="100vw"
      priority
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

    <div className="gap-4 absolute bottom-4 left-4 max-w-xl bg-gray-700/5 p-6 rounded-xl backdrop-blur-sm shadow-lg">
      <h1 className="text-3xl md:text-4xl font-bold">{collection.name}</h1>
      <p className="mt-2 text-gray-300 max-w-3xl">{collection.overview}</p>
      <p className="mt-2 text-gray-400">
        Average Rating: {avgCollectionRating(collection.parts)}
      </p>
      <p className="mt-2 text-gray-400">
        First Release: {firstLastRelease(collection.parts).first}
      </p>
      <p className="mt-2 text-gray-400">
        Last Release: {firstLastRelease(collection.parts).last}
      </p>
      <p className="mt-2 text-gray-400">
        Total Movies: {countMovies(collection.parts)}
      </p>

    </div>
  </section>
);

export default HeroCollection;
