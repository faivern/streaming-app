import { useState, useMemo } from "react";
import type { List } from "../../../types/list";
import type { MediaEntry, WatchStatus } from "../../../types/mediaEntry";
import type {
  DisplayItem,
  ViewMode,
  ListsSortOption,
  ActiveView,
} from "../../../types/lists.view";
import {
  listItemToDisplayItem,
  mediaEntryToDisplayItem,
} from "../../../types/lists.view";
import { useListsSorting } from "../../../hooks/lists/useListsSorting";
import ListHeader from "./ListHeader";
import ListGridView from "./ListGridView";
import ListRowView from "./ListRowView";
import EmptyListState from "./EmptyListState";
import TitleMid from "../../media/title/TitleMid";

type ListContentProps = {
  activeView: ActiveView;
  selectedStatus: WatchStatus;
  selectedList: List | null;
  mediaEntries: MediaEntry[];
  viewMode: ViewMode;
  sortOption: ListsSortOption;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (option: ListsSortOption) => void;
  onAddMedia: () => void;
  onEditEntry: (item: DisplayItem) => void;
  onRemoveItem: (item: DisplayItem) => void;
  isLoading?: boolean;
};

const STATUS_TITLES: Record<WatchStatus, string> = {
  WantToWatch: "Want to Watch",
  Watching: "Currently Watching",
  Watched: "Watched",
};

export default function ListContent({
  activeView,
  selectedStatus,
  selectedList,
  mediaEntries,
  viewMode,
  sortOption,
  onViewModeChange,
  onSortChange,
  onAddMedia,
  onEditEntry,
  onRemoveItem,
  isLoading,
}: ListContentProps) {
  // Toggle for showing status badges in custom lists (default ON for better sync visibility)
  const [showStatusBadges, setShowStatusBadges] = useState(true);
  // Edit mode toggle for grid view delete buttons
  const [isEditMode, setIsEditMode] = useState(false);

  // Only show status in custom lists (not in status tabs - that would be redundant)
  const isCustomList = activeView === "list";

  // Enrich list items with MediaEntry status data for custom lists
  const enrichedListItems = useMemo(() => {
    if (!selectedList || activeView !== "list") return [];

    // Create lookup map: "tmdbId-mediaType" → MediaEntry
    const entryMap = new Map<string, MediaEntry>();
    mediaEntries.forEach((entry) => {
      entryMap.set(`${entry.tmdbId}-${entry.mediaType}`, entry);
    });

    return selectedList.items.map((item) => {
      const matchingEntry = entryMap.get(`${item.tmdbId}-${item.mediaType}`);
      const displayItem = listItemToDisplayItem(item);

      if (matchingEntry) {
        return {
          ...displayItem,
          status: matchingEntry.status,
          ratingActing: matchingEntry.ratingActing,
          ratingStory: matchingEntry.ratingStory,
          ratingVisuals: matchingEntry.ratingVisuals,
          ratingSoundtrack: matchingEntry.ratingSoundtrack,
        };
      }
      return displayItem;
    });
  }, [selectedList, mediaEntries, activeView]);

  // Convert to display items based on active view
  const displayItems: DisplayItem[] =
    activeView === "status"
      ? mediaEntries
          .filter((entry) => entry.status === selectedStatus)
          .map(mediaEntryToDisplayItem)
      : enrichedListItems;

  // Apply sorting
  const sortedItems = useListsSorting(displayItems, sortOption);

  // Calculate movie and TV counts
  const movieCount = sortedItems.filter((item) => item.mediaType === "movie").length;
  const tvCount = sortedItems.filter((item) => item.mediaType === "tv").length;

  // Determine title and description
  const title =
    activeView === "status"
      ? STATUS_TITLES[selectedStatus]
      : selectedList?.name || "Select a List";

  const description =
    activeView === "list" ? selectedList?.description : undefined;

  // Loading skeleton
  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-6" />
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (sortedItems.length === 0) {
    return (
      <div>
        <ListHeader
          title={title}
          movieCount={0}
          tvCount={0}
          description={description}
          viewMode={viewMode}
          sortOption={sortOption}
          onViewModeChange={onViewModeChange}
          onSortChange={onSortChange}
          onAddMedia={onAddMedia}
          showAddButton={isCustomList}
          showStatusToggle={isCustomList}
          statusBadgesVisible={showStatusBadges}
          onStatusToggle={() => setShowStatusBadges(!showStatusBadges)}
          isEditMode={isEditMode}
          onEditToggle={() => setIsEditMode(!isEditMode)}
        />
        <EmptyListState
          type={activeView === "status" ? "status" : "list"}
          title={title}
          onAddMedia={isCustomList ? onAddMedia : undefined}
        />
      </div>
    );
  }

  return (
    <div>
      <ListHeader
        title={title}
        movieCount={movieCount}
        tvCount={tvCount}
        description={description}
        viewMode={viewMode}
        sortOption={sortOption}
        onViewModeChange={onViewModeChange}
        onSortChange={onSortChange}
        onAddMedia={onAddMedia}
        showAddButton={isCustomList}
        showStatusToggle={isCustomList}
        statusBadgesVisible={showStatusBadges}
        onStatusToggle={() => setShowStatusBadges(!showStatusBadges)}
        isEditMode={isEditMode}
        onEditToggle={() => setIsEditMode(!isEditMode)}
      />

      {viewMode === "grid" ? (
        <ListGridView
          items={sortedItems}
          isEditMode={isEditMode}
          onRemoveItem={onRemoveItem}
          onEditItem={activeView === "status" ? onEditEntry : undefined}
          showStatus={isCustomList}
        />
      ) : (
        <ListRowView
          items={sortedItems}
          onEditItem={activeView === "status" ? onEditEntry : undefined}
          onRemoveItem={onRemoveItem}
          showStatus={isCustomList && showStatusBadges}
        />
      )}
    </div>
  );
}
