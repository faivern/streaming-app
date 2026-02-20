import { Link } from "react-router-dom";
import Backdrop from "../shared/Backdrop";
import RatingPill from "../../ui/RatingPill";
import { useCollectionById } from "../../../hooks/collections/useCollections";
import { avgCollectionRating } from "../../../utils/avgCollectionRating";
type Props = {
  id: number;
  title: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
};

export default function CollectionCard({
  id,
  title,
  backdrop_path,
  poster_path,
}: Props) {
  const { data: collection } = useCollectionById(id);
  const avgRating = avgCollectionRating(collection?.parts);

  return (
    <Link
      to={`/collections/${id}`}
      className="w-full group block rounded-2xl shadow-lg duration-300 border border-gray-400/30 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950
         hover:scale-103 hover:border-accent-primary/75 relative overflow-hidden"
      aria-label={title}
    >
      <RatingPill
        rating={avgRating ? parseFloat(avgRating) : undefined}
        className="absolute top-2 right-2 z-10 bg-badge-primary/40 backdrop-blur-sm border-badge-foreground/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        showOutOfTen={false}
      />
      <Backdrop path={backdrop_path ?? undefined} alt={title} className="w-full" sizes="780px" priority={true} />

      {/* Hover gradient overlay with title */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
      </div>
    </Link>
  );
}
