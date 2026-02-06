import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition, Tab } from "@headlessui/react";
import { FaTimes, FaFilm, FaTv } from "react-icons/fa";
import Poster from "../../media/shared/Poster";
import StarRating from "../shared/StarRating";
import type { DisplayItem } from "../../../types/lists.view";
import type { WatchStatus } from "../../../types/mediaEntry";

type MediaEntryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    status: WatchStatus;
    ratingActing: number | null;
    ratingStory: number | null;
    ratingVisuals: number | null;
    ratingSoundtrack: number | null;
    notes: string;
  }) => void;
  item: DisplayItem | null;
  isLoading?: boolean;
};

const WATCH_STATUSES: { value: WatchStatus; label: string }[] = [
  { value: "WantToWatch", label: "Want to Watch" },
  { value: "Watching", label: "Watching" },
  { value: "Watched", label: "Watched" },
];

export default function MediaEntryModal({
  isOpen,
  onClose,
  onSave,
  item,
  isLoading,
}: MediaEntryModalProps) {
  const [status, setStatus] = useState<WatchStatus>("WantToWatch");
  const [ratingActing, setRatingActing] = useState<number | null>(null);
  const [ratingStory, setRatingStory] = useState<number | null>(null);
  const [ratingVisuals, setRatingVisuals] = useState<number | null>(null);
  const [ratingSoundtrack, setRatingSoundtrack] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  // Initialize state when item changes
  useEffect(() => {
    if (item) {
      setStatus(item.status || "WantToWatch");
      setRatingActing(item.ratingActing ?? null);
      setRatingStory(item.ratingStory ?? null);
      setRatingVisuals(item.ratingVisuals ?? null);
      setRatingSoundtrack(item.ratingSoundtrack ?? null);
      setNotes(item.review?.content || "");
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      status,
      ratingActing,
      ratingStory,
      ratingVisuals,
      ratingSoundtrack,
      notes: notes.trim(),
    });
  };

  const selectedStatusIndex = WATCH_STATUSES.findIndex(
    (s) => s.value === status
  );

  if (!item) return null;

  const mediaTypeLabel = item.mediaType === "movie" ? "Movie" : "TV Show";
  const MediaIcon = item.mediaType === "movie" ? FaFilm : FaTv;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-gray-900 border border-gray-700 shadow-xl transition-all max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  {/* Header with media info */}
                  <div className="flex items-start gap-4 p-4 border-b border-gray-700">
                    <Poster
                      path={item.posterPath || undefined}
                      alt={item.title}
                      className="w-20 h-30 rounded-lg flex-shrink-0"
                      useCustomSize
                    />
                    <div className="flex-1 min-w-0">
                      <Dialog.Title className="text-lg font-semibold text-white line-clamp-2">
                        {item.title}
                      </Dialog.Title>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                        <MediaIcon className="text-xs" />
                        <span>{mediaTypeLabel}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 min-w-11 min-h-11 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Watch status tabs */}
                  <div className="p-4 border-b border-gray-700">
                    <Tab.Group
                      selectedIndex={selectedStatusIndex}
                      onChange={(index) => setStatus(WATCH_STATUSES[index].value)}
                    >
                      <Tab.List className="flex gap-1 p-1 bg-gray-800 rounded-lg">
                        {WATCH_STATUSES.map((s) => (
                          <Tab
                            key={s.value}
                            className={({ selected }) =>
                              `flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors focus:outline-none ${
                                selected
                                  ? "bg-accent-primary text-white"
                                  : "text-gray-400 hover:text-white hover:bg-gray-700"
                              }`
                            }
                          >
                            {s.label}
                          </Tab>
                        ))}
                      </Tab.List>
                    </Tab.Group>
                  </div>

                  {/* Ratings */}
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-4">
                      Your Ratings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Acting</span>
                        <StarRating
                          value={ratingActing}
                          onChange={setRatingActing}
                          size="md"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Story</span>
                        <StarRating
                          value={ratingStory}
                          onChange={setRatingStory}
                          size="md"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Visuals</span>
                        <StarRating
                          value={ratingVisuals}
                          onChange={setRatingVisuals}
                          size="md"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Soundtrack</span>
                        <StarRating
                          value={ratingSoundtrack}
                          onChange={setRatingSoundtrack}
                          size="md"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Review */}
                  <div className="p-4 border-b border-gray-700">
                    <label
                      htmlFor="entry-notes"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Review
                    </label>
                    <textarea
                      id="entry-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Write your thoughts..."
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 p-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
