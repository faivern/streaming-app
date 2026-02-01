import { FaClock, FaEye, FaCheck } from "react-icons/fa";
import type { WatchStatus } from "../../../types/mediaEntry";

type WatchStatusBadgeProps = {
  status: WatchStatus;
  size?: "sm" | "md" | "lg";
  variant?: "badge" | "icon";
  className?: string;
  label?: string;
  title?: string;
};

const STATUS_CONFIG: Record<
  WatchStatus,
  { title: string; label: string; bgClass: string; textClass: string; borderClass: string; icon: React.ReactNode }
> = {
  WantToWatch: {
    title: "Want to Watch",
    label: "Want to Watch",
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-400",
    borderClass: "border-blue-400/50",
    icon: <FaClock />,
  },
  Watching: {
    title: "Watching",
    label: "Watching",
    bgClass: "bg-yellow-500/20",
    textClass: "text-yellow-400",
    borderClass: "border-yellow-400/50",
    icon: <FaEye />,
  },
  Watched: {
    title: "Watched",
    label: "Watched",
    bgClass: "bg-green-500/20",
    textClass: "text-green-400",
    borderClass: "border-green-400/50",
    icon: <FaCheck />,
  },
};

export default function WatchStatusBadge({
  status,
  size = "lg",
  variant = "badge",
  className = "",
  label,
  title,
}: WatchStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  // Icon-only variant: compact circular indicator
  if (variant === "icon") {
    return (
      <span
        className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm bg-black/60 border ${config.borderClass} ${config.textClass} ${className}`}
        title={title ?? config.title}
      >
        {config.icon}
      </span>
    );
  }

  // Default badge variant: text label
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-xs"
      : size === "md"
      ? "px-3 py-1 text-sm"
      : "px-4 py-1.5 text-base";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgClass} ${config.textClass} ${sizeClasses} ${className}`}
      title={title ?? config.title}
    >
      {label ?? config.label}
    </span>
  );
}

export { STATUS_CONFIG };
