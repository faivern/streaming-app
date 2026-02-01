import { Link } from "react-router-dom";
import Backdrop from "../shared/Backdrop";
import RatingPill from "../../ui/RatingPill";
import { useCollectionById } from "../../../hooks/collections/useCollections";
import { avgCollectionRating } from "../../../utils/avgCollectionRating";
import "../../../style/MediaCard.css";

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
      className="w-lg group block rounded-2xl shadow-lg duration-300 border border-gray-400/30 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950
         hover:scale-103 hover:border-accent-primary/75 relative overflow-hidden"
      aria-label={title}
    >
      <RatingPill
        rating={avgRating ? parseFloat(avgRating) : undefined}
        className="absolute top-2 right-2 z-10 bg-badge-primary/40 backdrop-blur-sm border-badge-foreground/40 rounded-xl"
        showOutOfTen={false}
      />
      <span className="shine-overlay" />
      <Backdrop path={backdrop_path ?? undefined} alt={title} className="w-full" sizes="780px" priority={true}  />
      <div className="p-3">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
    </Link>
  );
}
