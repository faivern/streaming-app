import { Link } from "react-router-dom";
import Backdrop from "../shared/Backdrop";
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
  return (
    <Link
      to={`/collections/${id}`} // route will come in Step 2
      className="w-lg group block rounded-2xl shadow-lg duration-300 border border-gray-400/30 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 
         hover:scale-103"
      aria-label={title}
    >
      <span className="shine-overlay" />
        <Backdrop path={backdrop_path} alt={title} className="w-full" />
      <div className="p-3">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
    </Link>
  );
}
