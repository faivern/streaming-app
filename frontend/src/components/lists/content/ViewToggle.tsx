import { FaThLarge, FaList } from "react-icons/fa";
import type { ViewMode } from "../../../types/lists.view";

type ViewToggleProps = {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
};

export default function ViewToggle({
  viewMode,
  onChange,
  className = "",
}: ViewToggleProps) {
  return (
    <div
      className={`inline-flex rounded-lg bg-[var(--action-primary)] p-1 ${className}`}
      role="radiogroup"
      aria-label="View mode"
    >
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === "list"}
        onClick={() => onChange("list")}
        className={`p-3 rounded-md transition-colors ${
          viewMode === "list"
            ? "bg-[var(--action-hover)] text-[var(--text-h1)]"
            : "text-[var(--subtle)] hover:text-[var(--text-h1)]"
        }`}
        aria-label="List view"
      >
        <FaList className="text-sm" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === "grid"}
        onClick={() => onChange("grid")}
        className={`p-3 rounded-md transition-colors ${
          viewMode === "grid"
            ? "bg-[var(--action-hover)] text-[var(--text-h1)]"
            : "text-[var(--subtle)] hover:text-[var(--text-h1)]"
        }`}
        aria-label="Grid view"
      >
        <FaThLarge className="text-sm" />
      </button>
    </div>
  );
}
