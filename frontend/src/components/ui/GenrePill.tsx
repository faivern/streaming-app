// components/ui/GenrePill.tsx
import Pill from "./Pill";
import genreMap from "../../utils/genreMap";

export default function GenrePill({
  id,
  name,
  className = "",
}: { id?: number; name?: string; className?: string }) {
  const label = name ?? (id != null ? genreMap[id] : undefined) ?? "Unknown";
  return (
    <Pill className={`text-sm ${className}`} title="Genre">
      {label}
    </Pill>
  );
}