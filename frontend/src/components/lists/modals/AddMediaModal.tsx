import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaTimes, FaSearch, FaPlus, FaCheck } from "react-icons/fa";
import { useSearch } from "../../../hooks/useSearch";
import Poster from "../../media/shared/Poster";

type AddMediaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (media: {
    tmdbId: number;
    mediaType: string;
    title: string;
    posterPath: string | null;
  }) => void;
  existingTmdbIds?: Set<number>;
  title?: string;
};

export default function AddMediaModal({
  isOpen,
  onClose,
  onAdd,
  existingTmdbIds = new Set(),
  title = "Add Media",
}: AddMediaModalProps) {
  const [query, setQuery] = useState("");
  const { results, loading, search, clearSearch, hasSearched } = useSearch();
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  const handleClose = () => {
    setQuery("");
    clearSearch();
    setAddedIds(new Set());
    onClose();
  };

  const handleAdd = (result: (typeof results)[0]) => {
    const mediaTitle = result.title || result.name || "Untitled";
    const posterPath = result.poster_path || null;
    const mediaType = result.media_type;

    onAdd({
      tmdbId: result.id,
      mediaType,
      title: mediaTitle,
      posterPath,
    });

    setAddedIds((prev) => new Set(prev).add(result.id));
  };

  // Filter to only movies and TV shows
  const filteredResults = results.filter(
    (r) => r.media_type === "movie" || r.media_type === "tv"
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                  <Dialog.Title className="text-lg font-semibold text-white">
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Search input */}
                <div className="p-4 border-b border-gray-700">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search movies and TV shows..."
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="p-4 max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  ) : hasSearched && filteredResults.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No results found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Try a different search term
                      </p>
                    </div>
                  ) : filteredResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {filteredResults.map((result) => {
                        const isAlreadyAdded =
                          existingTmdbIds.has(result.id) ||
                          addedIds.has(result.id);
                        const mediaTitle =
                          result.title || result.name || "Untitled";

                        return (
                          <div
                            key={result.id}
                            className="group relative rounded-lg overflow-hidden bg-gray-800"
                          >
                            <Poster
                              path={result.poster_path}
                              alt={mediaTitle}
                              className="w-full aspect-[2/3]"
                              useCustomSize
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                              <p className="text-white text-sm font-medium line-clamp-2 mb-2">
                                {mediaTitle}
                              </p>
                              <button
                                onClick={() => handleAdd(result)}
                                disabled={isAlreadyAdded}
                                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isAlreadyAdded
                                    ? "bg-green-600/50 text-green-200 cursor-default"
                                    : "bg-accent-primary hover:bg-accent-primary/80 text-white"
                                }`}
                              >
                                {isAlreadyAdded ? (
                                  <>
                                    <FaCheck className="text-xs" />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <FaPlus className="text-xs" />
                                    Add
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Media type badge */}
                            <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-gray-900/80 text-gray-300 rounded">
                              {result.media_type === "movie" ? "Movie" : "TV"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">
                        Search for movies and TV shows to add
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Done
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
