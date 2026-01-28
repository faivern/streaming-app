import type { WatchStatus } from "../../../types/mediaEntry";

type WatchStatusBadgeProps = {
  status: WatchStatus;
  size?: "sm" | "md";
  className?: string;
};

const STATUS_CONFIG: Record<
  WatchStatus,
  { label: string; bgClass: string; textClass: string }
> = {
  WantToWatch: {
    label: "Want to Watch",
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-400",
  },
  Watching: {
    label: "Watching",
    bgClass: "bg-yellow-500/20",
    textClass: "text-yellow-400",
  },
  Watched: {
    label: "Watched",
    bgClass: "bg-green-500/20",
    textClass: "text-green-400",
  },
};

export default function WatchStatusBadge({
  status,
  size = "sm",
  className = "",
}: WatchStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgClass} ${config.textClass} ${sizeClasses} ${className}`}
    >
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
