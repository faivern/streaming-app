import { useState } from "react";
import { FaBars, FaSignInAlt } from "react-icons/fa";
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
import ListsDrawer from "../../components/lists/sidebar/ListsDrawer";
import ListContent from "../../components/lists/content/ListContent";
import CreateListModal from "../../components/lists/modals/CreateListModal";
import EditListModal from "../../components/lists/modals/EditListModal";
import DeleteConfirmModal from "../../components/lists/modals/DeleteConfirmModal";
import LimitReachedModal from "../../components/lists/modals/LimitReachedModal";
import DiscoverModal from "../../components/discover/DiscoverModal";
import MediaEntryModal from "../../components/lists/modals/MediaEntryModal";

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

  // Mobile drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal state
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addMediaModalOpen, setAddMediaModalOpen] = useState(false);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
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
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
            <FaSignInAlt className="text-3xl text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Sign in to view your lists</h1>
          <p className="text-gray-400 mb-6">
            Track your movies and TV shows, create custom lists, and rate your favorites.
          </p>
          <a href={GOOGLE_LOGIN_URL}>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-accent-primary hover:bg-accent-primary/80 text-white font-medium rounded-lg transition-colors">
              <FaSignInAlt />
              Sign in with Google
            </button>
          </a>
        </div>
      </div>
    );
  }

  const isLoading = isLoadingUser || isLoadingLists || isLoadingEntries;

  // Get existing TMDB IDs for add modal
  const existingTmdbIds = new Set(currentList?.items.map((i) => i.tmdbId) || []);

  return (
    <div className="flex min-h-dvh mt-navbar-offset">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 border-r border-gray-700/50 bg-gray-900/50">
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

      {/* Mobile Drawer Trigger */}
      <div className="lg:hidden fixed bottom-4 left-4 z-(--z-overlay) pb-safe">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-accent-primary hover:bg-accent-primary/80 text-white font-medium rounded-full shadow-lg transition-colors"
        >
          <FaBars />
          <span>Lists</span>
        </button>
      </div>

      {/* Mobile Drawer */}
      <ListsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
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

      {/* Main Content */}
      <main className="flex-1 px-4 lg:px-8 py-6">
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
          isLoading={isLoading}
        />
      </main>

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

      <LimitReachedModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        title="List Limit Reached"
        message="You've reached the maximum number of lists. Delete an existing list to create a new one."
        currentCount={lists.length}
        maxCount={LIST_LIMITS.MAX_LISTS_PER_USER}
      />
    </div>
  );
}
