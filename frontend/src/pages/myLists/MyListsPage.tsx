import { useState } from "react";
import { FaSignInAlt, FaGoogle, FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

import { useUser } from "../../hooks/user/useUser";
import {
  useUserLists,
  useCreateList,
  useUpdateList,
  useDeleteList,
  useRemoveListItem,
} from "../../hooks/lists/useLists";
import {
  useMediaEntries,
  useWatchStatusCounts,
  useUpdateMediaEntry,
  useDeleteMediaEntry,
  useUpsertReview,
} from "../../hooks/lists/useMediaEntries";

import type { List } from "../../types/list";
import type { WatchStatus } from "../../types/mediaEntry";
import type { ActiveView, ViewMode, ListsSortOption, DisplayItem } from "../../types/lists.view";
import { GOOGLE_LOGIN_URL } from "../../lib/config";
import { LIST_LIMITS } from "../../lib/constants";

// Components
import ListsSidebar from "../../components/lists/sidebar/ListsSidebar";
import MobileListTabs from "../../components/lists/sidebar/MobileListTabs";
import ListContent from "../../components/lists/content/ListContent";
import CreateListModal from "../../components/lists/modals/CreateListModal";
import EditListModal from "../../components/lists/modals/EditListModal";
import DeleteConfirmModal from "../../components/lists/modals/DeleteConfirmModal";
import LimitReachedModal from "../../components/lists/modals/LimitReachedModal";
import DiscoverModal from "../../components/discover/DiscoverModal";
import MediaEntryModal from "../../components/lists/modals/MediaEntryModal";
import ItemContextSheet from "../../components/lists/modals/ItemContextSheet";

export default function MyListsPage() {
  const { data: user, isLoading: isLoadingUser } = useUser();

  // Data hooks
  const { data: lists = [], isLoading: isLoadingLists } = useUserLists();
  const { data: mediaEntries = [], isLoading: isLoadingEntries } = useMediaEntries();
  const statusCounts = useWatchStatusCounts();

  // Mutations
  const createListMutation = useCreateList();
  const updateListMutation = useUpdateList();
  const deleteListMutation = useDeleteList();
  const removeListItemMutation = useRemoveListItem();
  const updateMediaEntryMutation = useUpdateMediaEntry();
  const deleteMediaEntryMutation = useDeleteMediaEntry();
  const upsertReviewMutation = useUpsertReview();

  // View state - unified selection (only one can be active at a time)
  const [activeView, setActiveView] = useState<ActiveView>("status");
  const [selectedStatus, setSelectedStatus] = useState<WatchStatus>("WantToWatch");
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortOption, setSortOption] = useState<ListsSortOption>("date-added");

  // Unified handlers to ensure mutual exclusivity
  const handleSelectStatus = (status: WatchStatus) => {
    setActiveView("status");
    setSelectedStatus(status);
    setSelectedListId(null); // Clear list selection
  };

  const handleSelectList = (listId: number) => {
    setActiveView("list");
    setSelectedListId(listId);
    // Note: selectedStatus stays as fallback default, but activeView controls what's shown
  };

  // Modal state
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addMediaModalOpen, setAddMediaModalOpen] = useState(false);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [contextSheetOpen, setContextSheetOpen] = useState(false);
  const [contextSheetItem, setContextSheetItem] = useState<DisplayItem | null>(null);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DisplayItem | null>(null);

  // Get the currently selected list
  const currentList = lists.find((l) => l.id === selectedListId) || null;

  // Guard: check list limit before opening create modal
  const handleOpenCreateModal = () => {
    if (lists.length >= LIST_LIMITS.MAX_LISTS_PER_USER) {
      setLimitModalOpen(true);
    } else {
      setCreateModalOpen(true);
    }
  };

  // Handle list creation
  const handleCreateList = async (data: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => {
    try {
      const newList = await createListMutation.mutateAsync(data);
      toast.success(`List "${data.name}" created!`);
      setCreateModalOpen(false);
      // Select the new list
      setActiveView("list");
      setSelectedListId(newList.id);
    } catch {
      toast.error("Failed to create list");
    }
  };

  // Handle list update
  const handleUpdateList = async (data: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => {
    if (!selectedList) return;
    try {
      await updateListMutation.mutateAsync({
        id: selectedList.id,
        data,
      });
      toast.success("List updated!");
      setEditModalOpen(false);
      setSelectedList(null);
    } catch {
      toast.error("Failed to update list");
    }
  };

  // Handle list deletion
  const handleDeleteList = async () => {
    if (!selectedList) return;
    try {
      await deleteListMutation.mutateAsync(selectedList.id);
      toast.success(`List "${selectedList.name}" deleted`);
      setDeleteModalOpen(false);
      setSelectedList(null);
      // Switch to status view if we deleted the selected list
      if (selectedListId === selectedList.id) {
        setActiveView("status");
        setSelectedListId(null);
      }
    } catch {
      toast.error("Failed to delete list");
    }
  };

// Handle removing item from list or deleting media entry
  const handleRemoveItem = async (item: DisplayItem) => {
    if (item.source === "list" && currentList) {
      try {
        await removeListItemMutation.mutateAsync({
          listId: currentList.id,
          itemId: item.id,
        });
        toast.success(`Removed "${item.title}"`);
      } catch {
        toast.error("Failed to remove item");
      }
    } else if (item.source === "entry") {
      // Delete media entry (from MyTracking status views)
      try {
        await deleteMediaEntryMutation.mutateAsync(item.sourceId);
        toast.success(`Removed "${item.title}" from tracking`);
      } catch {
        toast.error("Failed to remove from tracking");
      }
    }
  };

  // Handle opening context sheet (mobile)
  const handleContextMenu = (item: DisplayItem) => {
    setContextSheetItem(item);
    setContextSheetOpen(true);
  };

  // Handle marking an item with a specific watch status (swipe or context sheet)
  const handleMarkStatus = async (item: DisplayItem, status: WatchStatus) => {
    // Find existing entry by tmdbId + mediaType
    const matchingEntry = mediaEntries.find(
      (e) => e.tmdbId === item.tmdbId && e.mediaType === item.mediaType,
    );

    if (matchingEntry) {
      try {
        await updateMediaEntryMutation.mutateAsync({
          id: matchingEntry.id,
          data: { status },
        });
        const statusLabel =
          status === "Watched"
            ? "Watched"
            : status === "Watching"
              ? "Watching"
              : "Want to Watch";
        toast.success(`"${item.title}" marked as ${statusLabel}`);
      } catch {
        toast.error("Failed to update status");
      }
    } else {
      toast.error("No tracking entry found. Track this item first.");
    }
  };

  // Handle editing media entry
  const handleEditEntry = (item: DisplayItem) => {
    setSelectedEntry(item);
    setEntryModalOpen(true);
  };

  // Handle saving media entry changes
  const handleSaveEntry = async (data: {
    status: WatchStatus;
    ratingActing: number | null;
    ratingStory: number | null;
    ratingVisuals: number | null;
    ratingSoundtrack: number | null;
    notes: string;
  }) => {
    if (!selectedEntry) return;

    // Find the entry ID - for "entry" source use sourceId directly,
    // for "list" source look up by tmdbId and mediaType
    let entryId: number | undefined;

    if (selectedEntry.source === "entry") {
      entryId = selectedEntry.sourceId;
    } else {
      // Find matching MediaEntry for this list item
      const matchingEntry = mediaEntries.find(
        (e) =>
          e.tmdbId === selectedEntry.tmdbId &&
          e.mediaType === selectedEntry.mediaType
      );
      entryId = matchingEntry?.id;
    }

    if (!entryId) {
      toast.error("No tracking entry found for this item");
      return;
    }

    try {
      // Update the entry
      await updateMediaEntryMutation.mutateAsync({
        id: entryId,
        data: {
          status: data.status,
          ratingActing: data.ratingActing ?? undefined,
          ratingStory: data.ratingStory ?? undefined,
          ratingVisuals: data.ratingVisuals ?? undefined,
          ratingSoundtrack: data.ratingSoundtrack ?? undefined,
        },
      });

      // Update review if notes changed
      if (data.notes) {
        await upsertReviewMutation.mutateAsync({
          entryId: entryId,
          data: { content: data.notes },
        });
      }

      toast.success("Entry updated!");
      setEntryModalOpen(false);
      setSelectedEntry(null);
    } catch {
      toast.error("Failed to update entry");
    }
  };

  // Not logged in state
  if (!isLoadingUser && !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-[var(--action-primary)] flex items-center justify-center mx-auto mb-6">
            <FaSignInAlt className="text-3xl text-[var(--subtle)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-h1)] mb-3">Sign in to view your lists</h1>
          <p className="text-[var(--subtle)] mb-6">
            Track your movies and TV shows, create custom lists, and rate your favorites.
          </p>
          <a href={GOOGLE_LOGIN_URL} className="flex items-center justify-center gap-3 px-6 py-3 bg-accent-secondary hover:bg-accent-primary text-white font-semibold rounded-xl transition-colors">
            <FaGoogle />
            Continue with Google
          </a>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingUser || isLoadingLists || isLoadingEntries;

  // Get existing TMDB IDs for add modal
  const existingTmdbIds = new Set(currentList?.items.map((i) => i.tmdbId) || []);

  return (
    <div className="flex min-h-dvh lg:mt-navbar-offset">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 border-r border-[var(--border)]/50 bg-[var(--background)]/50">
        <ListsSidebar
          lists={lists}
          activeView={activeView}
          selectedStatus={selectedStatus}
          selectedListId={selectedListId}
          statusCounts={statusCounts}
          onStatusChange={handleSelectStatus}
          onListSelect={handleSelectList}
          onCreateList={handleOpenCreateModal}
          onEditList={(list) => {
            setSelectedList(list);
            setEditModalOpen(true);
          }}
          onDeleteList={(list) => {
            setSelectedList(list);
            setDeleteModalOpen(true);
          }}
          isLoading={isLoadingLists}
        />
      </aside>

      {/* Mobile tabs + content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-clip">
        {/* Mobile Tab Bar — sticky below navbar */}
        <div className="lg:hidden sticky top-[var(--navbar-height)] z-(--z-sticky) bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)]/30">
          <MobileListTabs
            lists={lists}
            activeView={activeView}
            selectedStatus={selectedStatus}
            selectedListId={selectedListId}
            statusCounts={statusCounts}
            onStatusChange={handleSelectStatus}
            onListSelect={handleSelectList}
            onCreateList={handleOpenCreateModal}
            isLoading={isLoadingLists}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 px-page py-6">
          <ListContent
            activeView={activeView}
            selectedStatus={selectedStatus}
            selectedList={currentList}
            mediaEntries={mediaEntries}
            viewMode={viewMode}
            sortOption={sortOption}
            onViewModeChange={setViewMode}
            onSortChange={setSortOption}
            onAddMedia={() => setAddMediaModalOpen(true)}
            onEditEntry={handleEditEntry}
            onRemoveItem={handleRemoveItem}
            onContextMenu={handleContextMenu}
            onSwipeRight={(item) => handleMarkStatus(item, "Watched")}
            onSwipeLeft={handleRemoveItem}
            isLoading={isLoading}
          />
        </main>
      </div>

      {/* Modals */}
      <CreateListModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateList}
        isLoading={createListMutation.isPending}
      />

      <EditListModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedList(null);
        }}
        onSave={handleUpdateList}
        list={selectedList}
        isLoading={updateListMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedList(null);
        }}
        onConfirm={handleDeleteList}
        title="Delete List"
        message={`Are you sure you want to delete "${selectedList?.name}"? This action cannot be undone.`}
        isLoading={deleteListMutation.isPending}
      />

      <DiscoverModal
        isOpen={addMediaModalOpen}
        onClose={() => setAddMediaModalOpen(false)}
        existingTmdbIds={existingTmdbIds}
      />

      <MediaEntryModal
        isOpen={entryModalOpen}
        onClose={() => {
          setEntryModalOpen(false);
          setSelectedEntry(null);
        }}
        onSave={handleSaveEntry}
        item={selectedEntry}
        isLoading={updateMediaEntryMutation.isPending}
      />

      <ItemContextSheet
        isOpen={contextSheetOpen}
        onClose={() => {
          setContextSheetOpen(false);
          setContextSheetItem(null);
        }}
        item={contextSheetItem}
        onMarkStatus={handleMarkStatus}
        onEditEntry={handleEditEntry}
        onRemove={handleRemoveItem}
      />

      <LimitReachedModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        title="List Limit Reached"
        message="You've reached the maximum number of lists. Delete an existing list to create a new one."
        currentCount={lists.length}
        maxCount={LIST_LIMITS.MAX_LISTS_PER_USER}
      />

      {/* Mobile FAB — always-visible entry point to discover & add media */}
      <button
        onClick={() => setAddMediaModalOpen(true)}
        aria-label="Discover & add media"
        className="lg:hidden fixed bottom-6 right-6 z-(--z-sticky) w-14 h-14 flex items-center justify-center rounded-full bg-accent-primary text-white shadow-lg shadow-accent-primary/30 active:scale-95 transition-transform"
      >
        <FaPlus className="text-lg" />
      </button>
    </div>
  );
}
