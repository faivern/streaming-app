// components/ui/GenrePill.tsx
import { Link } from "react-router-dom";
import Pill from "./Pill";
import genreMap from "../../utils/genreMap";

export default function GenrePill({
  id,
  name,
  className = "",
  interactive = true,
}: { id?: number; name?: string; className?: string; interactive?: boolean }) {
  const label = name ?? (id != null ? genreMap[id] : undefined) ?? "Unknown";
  const pill = (
    <Pill className={`text-sm ${className}`} title="Genre">
      {label}
    </Pill>
  );

  if (id == null || !interactive) return pill;

  return (
    <Link
      to={`/genre/${id}`}
      className="hover:opacity-80 transition-opacity"
    >
      {pill}
    </Link>
  );
}