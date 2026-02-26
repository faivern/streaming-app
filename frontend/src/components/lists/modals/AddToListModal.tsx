import { Fragment, useState, useEffect, useMemo } from "react";
import { Dialog, Transition, Tab } from "@headlessui/react";
import {
  FaTimes,
  FaFilm,
  FaTv,
  FaPlus,
  FaCheck,
  FaClock,
  FaEye,
} from "react-icons/fa";
import toast from "react-hot-toast";
import Poster from "../../media/shared/Poster";
import StarRating from "../shared/StarRating";
import CreateListModal from "./CreateListModal";
import LimitReachedModal from "./LimitReachedModal";
import { LIST_LIMITS } from "../../../lib/constants";
import { useUserLists, useAddListItem } from "../../../hooks/lists/useLists";
import { useCreateList } from "../../../hooks/lists/useListMutations";
import { useMediaEntryByTmdbId } from "../../../hooks/mediaEntries/useMediaEntries";
import {
  useCreateMediaEntry,
  useUpdateMediaEntry,
  useUpsertReview,
} from "../../../hooks/mediaEntries/useMediaEntryMutations";
import type { WatchStatus } from "../../../types/mediaEntry";

type ModalStep = "select" | "rating";

type AddToListModalProps = {
  isOpen: boolean;
  onClose: () => void;
  media: {
    tmdbId: number;
    mediaType: string;
    title: string;
    posterPath: string | null;
    backdropPath?: string | null;
    overview?: string | null;
    voteAverage?: number | null;
  };
};

const WATCH_STATUSES: { value: WatchStatus; label: string }[] = [
  { value: "WantToWatch", label: "Want to Watch" },
  { value: "Watching", label: "Watching" },
  { value: "Watched", label: "Watched" },
];

const STATUS_COLORS: Record<WatchStatus, { border: string; bg: string; text: string }> = {
  WantToWatch: { border: "border-blue-400", bg: "bg-blue-500/20", text: "text-blue-400" },
  Watching: { border: "border-yellow-400", bg: "bg-yellow-500/20", text: "text-yellow-400" },
  Watched: { border: "border-green-400", bg: "bg-green-500/20", text: "text-green-400" },
};

export default function AddToListModal({
  isOpen,
  onClose,
  media,
}: AddToListModalProps) {
  // State
  const [step, setStep] = useState<ModalStep>("select");
  const [selectedListIds, setSelectedListIds] = useState<Set<number>>(
    new Set(),
  );
  const [status, setStatus] = useState<WatchStatus | null>(null);
  const [ratingActing, setRatingActing] = useState<number | null>(null);
  const [ratingStory, setRatingStory] = useState<number | null>(null);
  const [ratingVisuals, setRatingVisuals] = useState<number | null>(null);
  const [ratingSoundtrack, setRatingSoundtrack] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalConfig, setLimitModalConfig] = useState({
    title: "",
    message: "",
    currentCount: 0,
    maxCount: 0,
  });

  // Queries
  const { data: lists = [], isLoading: listsLoading } = useUserLists();
  const { data: existingEntry, isLoading: entryLoading } =
    useMediaEntryByTmdbId(media.tmdbId, media.mediaType);

  // Mutations
  const addListItem = useAddListItem();
  const createList = useCreateList();
  const createMediaEntry = useCreateMediaEntry();
  const updateMediaEntry = useUpdateMediaEntry();
  const upsertReview = useUpsertReview();

  // Compute which lists already contain this media
  const listsWithMedia = useMemo(() => {
    const ids = new Set<number>();
    lists.forEach((list) => {
      if (list.items.some((item) => item.tmdbId === media.tmdbId)) {
        ids.add(list.id);
      }
    });
    return ids;
  }, [lists, media.tmdbId]);

  // Initialize state from existing entry
  useEffect(() => {
    if (existingEntry) {
      setStatus(existingEntry.status);
      setRatingActing(existingEntry.ratingActing);
      setRatingStory(existingEntry.ratingStory);
      setRatingVisuals(existingEntry.ratingVisuals);
      setRatingSoundtrack(existingEntry.ratingSoundtrack);
      setNotes(existingEntry.review?.content || "");
    }
  }, [existingEntry]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("select");
      setSelectedListIds(new Set());
      setShowLimitModal(false);
      // Don't reset status/ratings if we have an existing entry - they'll be re-initialized
      if (!existingEntry) {
        setStatus("WantToWatch"); // Pre-select to encourage tracking
        setRatingActing(null);
        setRatingStory(null);
        setRatingVisuals(null);
        setRatingSoundtrack(null);
        setNotes("");
      }
    }
  }, [isOpen, existingEntry]);

  const handleClose = () => {
    onClose();
  };

  const toggleList = (listId: number) => {
    // Can't toggle if already in list
    if (listsWithMedia.has(listId)) return;

    setSelectedListIds((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  };

  const handleAddClick = async () => {
    const hasSelectedLists = selectedListIds.size > 0;
    const hasSelectedStatus = status !== null;
    const needsRating = status === "Watching" || status === "Watched";

    if (!hasSelectedLists && !hasSelectedStatus) {
      toast.error("Select a list or status");
      return;
    }

    // If status needs rating and we're on select step, go to rating step
    if (needsRating && step === "select") {
      setStep("rating");
      return;
    }

    // Otherwise, proceed with saving
    await handleSave();
  };

  const handleSave = async () => {
    const hasSelectedLists = selectedListIds.size > 0;
    const hasSelectedStatus = status !== null;

    try {
      // Check item limits before adding
      if (hasSelectedLists) {
        const fullList = lists.find(
          (l) =>
            selectedListIds.has(l.id) &&
            l.items.length >= LIST_LIMITS.MAX_ITEMS_PER_LIST,
        );
        if (fullList) {
          setLimitModalConfig({
            title: "Item Limit Reached",
            message: `"${fullList.name}" has reached the maximum number of items. Remove some items to add more.`,
            currentCount: fullList.items.length,
            maxCount: LIST_LIMITS.MAX_ITEMS_PER_LIST,
          });
          setShowLimitModal(true);
          return;
        }
      }

      // Add to selected lists (silent - we'll show one toast at the end)
      if (hasSelectedLists) {
        const promises = Array.from(selectedListIds).map((listId) =>
          addListItem.mutateAsync({
            listId,
            item: {
              tmdbId: media.tmdbId,
              mediaType: media.mediaType,
            },
            silent: true,
          }),
        );
        await Promise.all(promises);
      }

      // Create or update media entry (silent)
      if (hasSelectedStatus && status) {
        if (existingEntry) {
          // Update existing entry
          await updateMediaEntry.mutateAsync({
            id: existingEntry.id,
            data: {
              status,
              ratingActing: ratingActing ?? undefined,
              ratingStory: ratingStory ?? undefined,
              ratingVisuals: ratingVisuals ?? undefined,
              ratingSoundtrack: ratingSoundtrack ?? undefined,
            },
            silent: true,
          });

          // Update review if notes provided
          if (notes.trim()) {
            await upsertReview.mutateAsync({
              entryId: existingEntry.id,
              data: { content: notes.trim() },
              silent: true,
            });
          }
        } else {
          // Create new entry
          const newEntry = await createMediaEntry.mutateAsync({
            tmdbId: media.tmdbId,
            mediaType: media.mediaType,
            status,
            silent: true,
          });

          // Add ratings and review if provided
          const hasRatings =
            ratingActing || ratingStory || ratingVisuals || ratingSoundtrack;
          if (hasRatings || notes.trim()) {
            if (hasRatings) {
              await updateMediaEntry.mutateAsync({
                id: newEntry.id,
                data: {
                  ratingActing: ratingActing ?? undefined,
                  ratingStory: ratingStory ?? undefined,
                  ratingVisuals: ratingVisuals ?? undefined,
                  ratingSoundtrack: ratingSoundtrack ?? undefined,
                },
                silent: true,
              });
            }
            if (notes.trim()) {
              await upsertReview.mutateAsync({
                entryId: newEntry.id,
                data: { content: notes.trim() },
                silent: true,
              });
            }
          }
        }
      }

      // Show ONE clear success message
      const listCount = selectedListIds.size;
      const listNames = lists
        .filter((l) => selectedListIds.has(l.id))
        .map((l) => l.name);

      if (hasSelectedLists && hasSelectedStatus) {
        const listPart =
          listCount === 1 ? (
            <span> {' '} <strong>{listNames[0]}</strong> </span>
          ) : (
            `${listCount} lists`
          );
        toast.success(
          <span>Added to {listPart} and as <strong>{status === "WantToWatch" ? "Want to Watch" : status === "Watching" ? "Watching" : "Watched"}</strong></span>,
        );
      } else if (hasSelectedLists) {
        const listPart =
          listCount === 1 ? (
            <span> {' '} <strong>{listNames[0]}</strong> </span>
          ) : (
            `${listCount} lists`
          );
        toast.success(`Added to ${listPart}`);
      } else if (hasSelectedStatus) {
        toast.success(
          <span>Added as {' '}<strong>{status === "WantToWatch" ? "Want to Watch" : status === "Watching" ? "Watching" : "Watched"}</strong></span>,
        );
      }

      handleClose();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleSkipRating = async () => {
    await handleSave();
  };

  const handleCreateList = async (data: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => {
    try {
      const newList = await createList.mutateAsync(data);
      setShowCreateListModal(false);
      // Auto-select the new list
      setSelectedListIds((prev) => new Set(prev).add(newList.id));
    } catch {
      // Error handled by mutation
    }
  };

  const selectedStatusIndex = status
    ? WATCH_STATUSES.findIndex((s) => s.value === status)
    : -1;

  const isLoading = listsLoading || entryLoading;
  const isSaving =
    addListItem.isPending ||
    createMediaEntry.isPending ||
    updateMediaEntry.isPending ||
    upsertReview.isPending;

  const mediaTypeLabel = media.mediaType === "movie" ? "Movie" : "TV Show";
  const MediaIcon = media.mediaType === "movie" ? FaFilm : FaTv;

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-(--z-modal)" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end sm:items-center justify-center sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-component-primary border border-outline shadow-xl transition-all max-h-[90dvh] sm:max-h-[85dvh] overflow-y-auto overscroll-contain">
                  {/* Header with media info */}
                  <div className="flex items-start gap-4 p-4 border-b border-[var(--border)]">
                    <Poster
                      path={media.posterPath || undefined}
                      alt={media.title}
                      className="w-20 h-30 rounded-lg flex-shrink-0"
                      useCustomSize
                    />
                    <div className="flex-1 min-w-0">
                      <Dialog.Title className="text-lg font-semibold text-[var(--text-h1)] line-clamp-2">
                        {media.title}
                      </Dialog.Title>
                      <div className="flex items-center gap-2 mt-1 text-sm text-[var(--subtle)]">
                        <MediaIcon className="text-xs" />
                        <span>{mediaTypeLabel}</span>
                      </div>
                      {step === "rating" && (
                        <p className="text-sm text-accent-primary mt-2">
                          Rate this {mediaTypeLabel.toLowerCase()}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-2 min-w-11 min-h-11 flex items-center justify-center text-[var(--subtle)] hover:text-[var(--text-h1)] rounded-lg hover:bg-[var(--action-hover)] transition-colors flex-shrink-0"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {step === "select" ? (
                    <>
                      {/* Status section - FIRST to encourage tracking */}
                      <div className="p-4 border-b border-[var(--border)] bg-[var(--action-primary)]/30">
                        <h3 className="text-sm font-medium text-[var(--subtle)] mb-1">
                          Track in My Library
                          {existingEntry && (
                            <span className="ml-2 text-xs text-accent-primary">
                              (Already tracking)
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-[var(--subtle)] mb-3">
                          Keep track of what you've watched
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {WATCH_STATUSES.map((s) => {
                            const isSelected = status === s.value;
                            const colors = STATUS_COLORS[s.value];
                            const Icon =
                              s.value === "WantToWatch"
                                ? FaClock
                                : s.value === "Watching"
                                  ? FaEye
                                  : FaCheck;
                            return (
                              <button
                                key={s.value}
                                type="button"
                                onClick={() =>
                                  setStatus(isSelected ? null : s.value)
                                }
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? `${colors.border} ${colors.bg}`
                                    : "border-[var(--border)] hover:border-[var(--border)] bg-[var(--action-primary)]/50"
                                }`}
                              >
                                <Icon
                                  className={`text-lg mx-auto mb-1 ${
                                    isSelected
                                      ? colors.text
                                      : "text-[var(--subtle)]"
                                  }`}
                                />
                                <span
                                  className={`text-xs font-medium block ${
                                    isSelected ? "text-[var(--text-h1)]" : "text-[var(--subtle)]"
                                  }`}
                                >
                                  {s.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Lists section */}
                      <div className="p-4 border-b border-[var(--border)]">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-[var(--subtle)]">
                            Add to Lists
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              if (lists.length >= LIST_LIMITS.MAX_LISTS_PER_USER) {
                                setLimitModalConfig({
                                  title: "List Limit Reached",
                                  message: "You've reached the maximum number of lists. Delete an existing list to create a new one.",
                                  currentCount: lists.length,
                                  maxCount: LIST_LIMITS.MAX_LISTS_PER_USER,
                                });
                                setShowLimitModal(true);
                              } else {
                                setShowCreateListModal(true);
                              }
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-accent-primary hover:text-white hover:bg-accent-primary/20 rounded-lg transition-colors"
                          >
                            <FaPlus className="text-xs" />
                            New List
                          </button>
                        </div>

                        {isLoading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-12 bg-[var(--action-primary)] rounded-lg animate-pulse"
                              />
                            ))}
                          </div>
                        ) : lists.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-[var(--subtle)] text-sm">
                              You don't have any lists yet
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                if (lists.length >= LIST_LIMITS.MAX_LISTS_PER_USER) {
                                  setLimitModalConfig({
                                    title: "List Limit Reached",
                                    message: "You've reached the maximum number of lists. Delete an existing list to create a new one.",
                                    currentCount: lists.length,
                                    maxCount: LIST_LIMITS.MAX_LISTS_PER_USER,
                                  });
                                  setShowLimitModal(true);
                                } else {
                                  setShowCreateListModal(true);
                                }
                              }}
                              className="mt-3 px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Create Your First List
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-48 overflow-y-auto overscroll-contain">
                            {lists.map((list) => {
                              const isInList = listsWithMedia.has(list.id);
                              const isSelected = selectedListIds.has(list.id);

                              return (
                                <button
                                  key={list.id}
                                  type="button"
                                  onClick={() => toggleList(list.id)}
                                  disabled={isInList}
                                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                                    isInList
                                      ? "bg-green-500/10 border border-green-500/30 cursor-default"
                                      : isSelected
                                        ? "bg-accent-primary/20 border border-accent-primary/50"
                                        : "bg-input border border-outline hover:border-[var(--border)]"
                                  }`}
                                >
                                  <div className="text-left">
                                    <p
                                      className={`text-sm font-medium ${
                                        isInList
                                          ? "text-green-400"
                                          : "text-white"
                                      }`}
                                    >
                                      {list.name}
                                    </p>
                                    <p className="text-xs text-[var(--subtle)]">
                                      {list.items.length} item
                                      {list.items.length !== 1 ? "s" : ""}
                                    </p>
                                  </div>
                                  {isInList ? (
                                    <FaCheck className="text-green-400" />
                                  ) : isSelected ? (
                                    <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center">
                                      <FaCheck className="text-white text-xs" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-[var(--border)]" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-3 p-4">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="px-4 py-2 text-sm font-medium text-[var(--subtle)] hover:text-[var(--text-h1)] transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddClick}
                          disabled={
                            isSaving ||
                            (selectedListIds.size === 0 && status === null)
                          }
                          className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 disabled:bg-[var(--action-primary)] disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {isSaving
                            ? "Adding..."
                            : status === "Watching" || status === "Watched"
                              ? "Next"
                              : "Add"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Rating step */}
                      <div className="p-4 border-b border-[var(--border)]">
                        <h3 className="text-sm font-medium text-[var(--subtle)] mb-4">
                          Your Ratings
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--subtle)]">
                              Acting
                            </span>
                            <StarRating
                              value={ratingActing}
                              onChange={setRatingActing}
                              size="md"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--subtle)]">Story</span>
                            <StarRating
                              value={ratingStory}
                              onChange={setRatingStory}
                              size="md"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--subtle)]">
                              Visuals
                            </span>
                            <StarRating
                              value={ratingVisuals}
                              onChange={setRatingVisuals}
                              size="md"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--subtle)]">
                              Soundtrack
                            </span>
                            <StarRating
                              value={ratingSoundtrack}
                              onChange={setRatingSoundtrack}
                              size="md"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Review */}
                      <div className="p-4 border-b border-[var(--border)]">
                        <label
                          htmlFor="entry-notes"
                          className="block text-sm font-medium text-[var(--subtle)] mb-2"
                        >
                          Review
                        </label>
                        <textarea
                          id="entry-notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Write your thoughts..."
                          rows={3}
                          className="w-full px-3 py-2 bg-input border border-outline rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 resize-none"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between p-4">
                        <button
                          type="button"
                          onClick={() => setStep("select")}
                          className="px-4 py-2 text-sm font-medium text-[var(--subtle)] hover:text-[var(--text-h1)] transition-colors"
                        >
                          Back
                        </button>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleSkipRating}
                            disabled={isSaving}
                            className="px-4 py-2 text-sm font-medium text-[var(--subtle)] hover:text-[var(--text-h1)] transition-colors"
                          >
                            Skip
                          </button>
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 disabled:bg-[var(--action-primary)] disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Create List Modal */}
      <CreateListModal
        isOpen={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        onCreate={handleCreateList}
        isLoading={createList.isPending}
      />

      {/* Limit Reached Modal */}
      <LimitReachedModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title={limitModalConfig.title}
        message={limitModalConfig.message}
        currentCount={limitModalConfig.currentCount}
        maxCount={limitModalConfig.maxCount}
      />
    </>
  );
}
