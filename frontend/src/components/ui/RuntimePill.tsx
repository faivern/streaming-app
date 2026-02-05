// components/ui/RuntimePill.tsx
import Pill from "./Pill";
import { Clock } from "lucide-react";
import useMediaRuntime from "../../hooks/media/useMediaRuntime";

type RuntimePillProps = {
  mediaType: string;
  runtimeMin?: number | null;
  seasons?: number | null;
  episodes?: number | null;
  className?: string;
};

export default function RuntimePill({
  mediaType,
  runtimeMin,
  seasons,
  episodes,
  className = "",
}: RuntimePillProps) {
  const text = useMediaRuntime({ mediaType, runtimeMin, seasons, episodes });

  if (!text) return null;

  return (
    <Pill
      className={className}
      icon={<Clock className="h-4 w-4" />}
      title={mediaType === "movie" ? "Runtime" : "TV info"}
    >
      {text}
    </Pill>
  );
}
