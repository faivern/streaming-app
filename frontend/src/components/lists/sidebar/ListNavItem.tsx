import { FaList, FaEllipsisV } from "react-icons/fa";
import type { List } from "../../../types/list";

type ListNavItemProps = {
  list: List;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ListNavItem({
  list,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: ListNavItemProps) {
  return (
    <div
      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "bg-accent-primary/20 text-accent-primary"
          : "text-[var(--subtle)] hover:bg-[var(--action-hover)] hover:text-[var(--text-h1)]"
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <span className="flex items-center gap-2 min-w-0 flex-1">
        <FaList className="text-xs flex-shrink-0" />
        <span className="truncate text-sm font-medium">{list.name}</span>
      </span>

      <div className="flex items-center gap-2">

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Toggle dropdown - for now we'll use a simple approach
              const menu = e.currentTarget.nextElementSibling;
              if (menu) {
                menu.classList.toggle("hidden");
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--action-hover)] rounded transition-opacity"
            aria-label="List options"
          >
            <FaEllipsisV className="text-xs" />
          </button>

          <div className="hidden absolute right-0 top-full mt-1 w-32 bg-[var(--action-primary)] border border-[var(--border)] rounded-lg shadow-lg z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                // Hide menu
                e.currentTarget.parentElement?.classList.add("hidden");
              }}
              className="w-full px-3 py-2 text-left text-sm text-[var(--subtle)] hover:bg-[var(--action-hover)] hover:text-[var(--text-h1)] transition-colors rounded-t-lg"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                // Hide menu
                e.currentTarget.parentElement?.classList.add("hidden");
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-[var(--action-hover)] hover:text-red-300 transition-colors rounded-b-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
