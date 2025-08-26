// components/ui/TvInfoPill.tsx
import Pill from "./Pill";
import { Clock } from "lucide-react";

export default function TvInfoPill({
  seasons,
  episodes,
  className = "",
}: { seasons?: number; episodes?: number; className?: string }) {
  return (
    <Pill className={className} icon={<Clock className="h-4 w-4" />} title="TV info">
      {seasons ?? "?"} Season{seasons === 1 ? "" : "s"} {" • "}
      {episodes ?? "?"} Episode{episodes === 1 ? "" : "s"}
    </Pill>
  );
}
