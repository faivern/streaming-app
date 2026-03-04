import { useState, useRef, useEffect } from "react";
import { FaList, FaEllipsisV, FaPen, FaTrash } from "react-icons/fa";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

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
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--action-hover)] rounded transition-opacity"
            aria-label="List options"
          >
            <FaEllipsisV className="text-xs" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-[var(--action-primary)] border border-[var(--border)] rounded-lg shadow-lg z-10 px-1 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-[var(--subtle)] hover:bg-[var(--action-hover)] hover:text-[var(--text-h1)] transition-colors rounded-md"
              >
                <FaPen className="text-xs" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-2 py-2 text-left text-sm text-red-400 hover:bg-[var(--action-hover)] hover:text-red-300 transition-colors rounded-md"
              >
                <FaTrash className="text-xs" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
