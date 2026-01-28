import { Tab } from "@headlessui/react";
import type { WatchStatus } from "../../../types/mediaEntry";
import { FaEye, FaClock, FaCheck } from "react-icons/fa";

type WatchStatusTabsProps = {
  selectedStatus: WatchStatus;
  onStatusChange: (status: WatchStatus) => void;
  counts: {
    WantToWatch: number;
    Watching: number;
    Watched: number;
  };
  isActive?: boolean; // Whether status view is currently active (vs custom list view)
};

const TABS: { status: WatchStatus; label: string; icon: React.ReactNode }[] = [
  { status: "WantToWatch", label: "Want to Watch", icon: <FaClock /> },
  { status: "Watching", label: "Watching", icon: <FaEye /> },
  { status: "Watched", label: "Watched", icon: <FaCheck /> },
];

export default function WatchStatusTabs({
  selectedStatus,
  onStatusChange,
  counts,
  isActive = true,
}: WatchStatusTabsProps) {
  // Only show selection when status view is active; -1 means no selection
  const selectedIndex = isActive
    ? TABS.findIndex((t) => t.status === selectedStatus)
    : -1;

  return (
    <Tab.Group
      selectedIndex={selectedIndex}
      onChange={(index) => onStatusChange(TABS[index].status)}
    >
      <Tab.List className="flex flex-col gap-1">
        {TABS.map((tab) => (
          <Tab
            key={tab.status}
            className={({ selected }) =>
              `flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary/50 ${
                selected
                  ? "bg-accent-primary/20 text-accent-primary"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <span className="flex items-center gap-2">
              <span className="text-xs">{tab.icon}</span>
              {tab.label}
            </span>
            <span className="text-xs bg-gray-700/50 px-2 py-0.5 rounded-full">
              {counts[tab.status]}
            </span>
          </Tab>
        ))}
      </Tab.List>
    </Tab.Group>
  );
}
