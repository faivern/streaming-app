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
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
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
        <span className="text-xs bg-gray-700/50 px-2 py-0.5 rounded-full">
          {list.items.length}
        </span>

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
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
            aria-label="List options"
          >
            <FaEllipsisV className="text-xs" />
          </button>

          <div className="hidden absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                // Hide menu
                e.currentTarget.parentElement?.classList.add("hidden");
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors rounded-t-lg"
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
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors rounded-b-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
