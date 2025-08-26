// components/ui/RuntimePill.tsx
import Pill from "./Pill";
import { Clock } from "lucide-react";

export default function RuntimePill({
  minutes,
  className = "",
}: { minutes?: number; className?: string }) {
  const text =
    minutes != null
      ? `${Math.floor(minutes / 60)}h ${minutes % 60}min`
      : "No runtime";
  return (
    <Pill className={className} icon={<Clock className="h-4 w-4" />} title="Runtime">
      {text}
    </Pill>
  );
}
