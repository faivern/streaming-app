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
      className={`inline-flex rounded-lg bg-gray-800 p-1 ${className}`}
      role="radiogroup"
      aria-label="View mode"
    >
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === "grid"}
        onClick={() => onChange("grid")}
        className={`p-2 rounded-md transition-colors ${
          viewMode === "grid"
            ? "bg-gray-700 text-white"
            : "text-gray-400 hover:text-white"
        }`}
        aria-label="Grid view"
      >
        <FaThLarge className="text-sm" />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === "list"}
        onClick={() => onChange("list")}
        className={`p-2 rounded-md transition-colors ${
          viewMode === "list"
            ? "bg-gray-700 text-white"
            : "text-gray-400 hover:text-white"
        }`}
        aria-label="List view"
      >
        <FaList className="text-sm" />
      </button>
    </div>
  );
}
