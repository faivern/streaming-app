import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Plus } from "lucide-react";
import { FaEye, FaClock, FaCheck } from "react-icons/fa";
import type { List } from "../../../types/list";
import type { WatchStatus } from "../../../types/mediaEntry";
import type { ActiveView } from "../../../types/lists.view";

type MobileListTabsProps = {
  lists: List[];
  activeView: ActiveView;
  selectedStatus: WatchStatus;
  selectedListId: number | null;
  statusCounts: {
    WantToWatch: number;
    Watching: number;
    Watched: number;
  };
  onStatusChange: (status: WatchStatus) => void;
  onListSelect: (listId: number) => void;
  onCreateList: () => void;
  isLoading?: boolean;
};

const STATUS_TABS: {
  status: WatchStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  { status: "WantToWatch", label: "Want to Watch", icon: <FaClock /> },
  { status: "Watching", label: "Watching", icon: <FaEye /> },
  { status: "Watched", label: "Watched", icon: <FaCheck /> },
];

const chipBase =
  "px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 transition-colors";
const chipActive = "bg-accent-primary/20 text-accent-primary";
const chipInactive =
  "bg-[var(--action-primary)] text-[var(--subtle)] hover:bg-[var(--action-hover)]";

export default function MobileListTabs({
  lists,
  activeView,
  selectedStatus,
  selectedListId,
  onStatusChange,
  onListSelect,
  onCreateList,
  isLoading,
}: MobileListTabsProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Scroll active chip into view when selection changes
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeView, selectedStatus, selectedListId]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-page py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 rounded-lg bg-[var(--action-primary)] animate-pulse flex-shrink-0"
            style={{ width: `${60 + i * 12}px` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-page py-3">
      {/* Insights chip */}
      <Link
        to="/lists/insights"
        className={`${chipBase} ${chipInactive}`}
      >
        <BarChart3 className="w-3.5 h-3.5" />
        Insights
      </Link>

      {/* Divider */}
      <div className="w-px h-6 bg-[var(--border)]/50 flex-shrink-0" />

      {/* Watch status chips */}
      {STATUS_TABS.map((tab) => {
        const isActive =
          activeView === "status" && selectedStatus === tab.status;
        return (
          <button
            key={tab.status}
            ref={isActive ? activeRef : undefined}
            onClick={() => onStatusChange(tab.status)}
            className={`${chipBase} ${isActive ? chipActive : chipInactive}`}
          >
            <span className="text-xs">{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}

      {/* Divider */}
      {lists.length > 0 && (
        <div className="w-px h-6 bg-[var(--border)]/50 flex-shrink-0" />
      )}

      {/* Custom list chips */}
      {lists.map((list) => {
        const isActive =
          activeView === "list" && selectedListId === list.id;
        return (
          <button
            key={list.id}
            ref={isActive ? activeRef : undefined}
            onClick={() => onListSelect(list.id)}
            className={`${chipBase} ${isActive ? chipActive : chipInactive} max-w-[150px]`}
          >
            <span className="truncate">{list.name}</span>
          </button>
        );
      })}

      {/* Create list chip */}
      <button
        onClick={onCreateList}
        className={`${chipBase} ${chipInactive}`}
        aria-label="Create new list"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
