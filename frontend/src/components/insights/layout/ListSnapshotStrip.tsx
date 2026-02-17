import { Link } from "react-router-dom";
import { Layers, Lock } from "lucide-react";
import type { List } from "../../../types/list";

type ListSnapshotStripProps = {
  lists: List[];
  activeListId: number | "master";
};

export default function ListSnapshotStrip({ lists, activeListId }: ListSnapshotStripProps) {
  if (lists.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
      {/* "All Lists" tab — always enabled */}
      <Link
        to="/lists/insights"
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
          activeListId === "master"
            ? "bg-accent-primary text-white"
            : "bg-component-primary/40 text-subtle hover:bg-component-primary/70 hover:text-text-h1"
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        All Lists
      </Link>

      {/* Per-list tabs */}
      {lists.map((list) => {
        const hasEnoughData = list.items.length >= 3;
        const isActive = activeListId === list.id;
        const remaining = 3 - list.items.length;

        if (!hasEnoughData) {
          return (
            <div
              key={list.id}
              title={`Add ${remaining} more item${remaining === 1 ? "" : "s"} to unlock`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 opacity-40 cursor-not-allowed bg-component-primary/20 text-subtle select-none"
            >
              <Lock className="w-3 h-3" />
              {list.name}
              <span className="text-xs">({list.items.length}/3)</span>
            </div>
          );
        }

        return (
          <Link
            key={list.id}
            to={`/list/${list.id}/insights`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
              isActive
                ? "bg-accent-primary text-white"
                : "bg-component-primary/40 text-subtle hover:bg-component-primary/70 hover:text-text-h1"
            }`}
          >
            {list.name}
          </Link>
        );
      })}
    </div>
  );
}
