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
  // Convert to display items based on active view
  const displayItems: DisplayItem[] =
    activeView === "status"
      ? mediaEntries
          .filter((entry) => entry.status === selectedStatus)
          .map(mediaEntryToDisplayItem)
      : selectedList?.items.map(listItemToDisplayItem) || [];

  // Apply sorting
  const sortedItems = useListsSorting(displayItems, sortOption);

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
          itemCount={0}
          description={description}
          viewMode={viewMode}
          sortOption={sortOption}
          onViewModeChange={onViewModeChange}
          onSortChange={onSortChange}
          onAddMedia={onAddMedia}
          showAddButton={activeView === "list"}
        />
        <EmptyListState
          type={activeView === "status" ? "status" : "list"}
          title={title}
          onAddMedia={activeView === "list" ? onAddMedia : undefined}
        />
      </div>
    );
  }

  return (
    <div>
      <ListHeader
        title={title}
        itemCount={sortedItems.length}
        description={description}
        viewMode={viewMode}
        sortOption={sortOption}
        onViewModeChange={onViewModeChange}
        onSortChange={onSortChange}
        onAddMedia={onAddMedia}
        showAddButton={activeView === "list"}
      />

      {viewMode === "grid" ? (
        <ListGridView items={sortedItems} />
      ) : (
        <ListRowView
          items={sortedItems}
          onEditItem={onEditEntry}
          onRemoveItem={onRemoveItem}
          showStatus={activeView === "status"}
        />
      )}
    </div>
  );
}
