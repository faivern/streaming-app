import { Fragment, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FaTimes,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { useSearch } from "../../hooks/useSearch";
import { useInfiniteAdvancedDiscover } from "../../hooks/discover/useInfiniteAdvancedDiscover";
import { useDiscoverFilters } from "../../hooks/discover/useDiscoverFilters";
import type { AdvancedDiscoverParams } from "../../api/advancedDiscover.api";
import Poster from "../media/shared/Poster";
import RatingPill from "../ui/RatingPill";
import {
  GenreCheckboxList,
  YearRangeSelector,
  RatingSlider,
  RuntimeSelector,
  LanguageDropdown,
  SortByDropdown,
} from "./filters";
import MobileFilterDrawer from "./MobileFilterDrawer";
import AddToListModal from "../lists/modals/AddToListModal";

type SelectedMedia = {
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  voteAverage?: number | null;
};

type DiscoverModalProps = {
  isOpen: boolean;
  onClose: () => void;
  existingTmdbIds?: Set<number>;
  title?: string;
};

export default function DiscoverModal({
  isOpen,
  onClose,
  existingTmdbIds = new Set(),
  title = "Discover",
}: DiscoverModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);

  // Ref for infinite scroll sentinel element
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    filters,
    setMediaType,
    toggleGenre,
    clearGenres,
    setReleaseYearRange,
    clearReleaseYearRange,
    setMinRating,
    clearMinRating,
    setRuntimeRange,
    clearRuntimeRange,
    setLanguage,
    clearLanguage,
    setSortBy,
    resetFilters,
    hasActiveFilters,
  } = useDiscoverFilters();

  // Search hook for search mode
  const {
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    totalResults: searchTotalResults,
    search,
    clearSearch,
    hasSearched,
    hasNextPage: searchHasNext,
    fetchNextPage: searchFetchNext,
    loadingNextPage: searchFetchingNext,
  } = useSearch();

  // Build discover params from current filter state
  const discoverParams: Omit<AdvancedDiscoverParams, "page"> = useMemo(
    () => ({
      mediaType: filters.mediaType,
      genreIds: filters.genreIds.length > 0 ? filters.genreIds : undefined,
      primaryReleaseYearGte: filters.releaseYearRange.min,
      primaryReleaseYearLte: filters.releaseYearRange.max,
      voteAverageGte: filters.minRating > 0 ? filters.minRating : undefined,
      runtimeGte: filters.mediaType === "movie" ? filters.runtimeRange.min : undefined,
      runtimeLte: filters.mediaType === "movie" ? filters.runtimeRange.max : undefined,
      language: filters.language || undefined,
      sortBy: filters.sortBy,
    }),
    [filters]
  );

  // Infinite query for discover mode
  const {
    data: discoverData,
    isLoading: discoverLoading,
    isFetchingNextPage: discoverFetchingNext,
    hasNextPage: discoverHasNext,
    fetchNextPage: discoverFetchNext,
  } = useInfiniteAdvancedDiscover(discoverParams, {
    enabled: isOpen && !isSearchMode,
  });

  // Unified pagination state based on mode
  const isFetchingNextPage = isSearchMode
    ? searchFetchingNext
    : discoverFetchingNext;
  const hasNextPage = isSearchMode
    ? searchHasNext
    : discoverHasNext;
  const fetchNextPage = isSearchMode
    ? searchFetchNext
    : discoverFetchNext;

  // Load more when scrolling near the bottom
  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  // Intersection Observer for infinite scroll (works for all modes including search)
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          handleLoadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, handleLoadMore, isOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearchMode(true);
        search(searchQuery);
      } else {
        setIsSearchMode(false);
        clearSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, search, clearSearch]);

  const handleClose = () => {
    setSearchQuery("");
    clearSearch();
    setIsSearchMode(false);
    setSelectedMedia(null);
    resetFilters();
    onClose();
  };

  const handleCardClick = (item: {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    media_type?: string;
    vote_average?: number;
  }) => {
    const mediaTitle = item.title || item.name || "Untitled";
    const posterPath = item.poster_path || null;
    // In discover mode, media_type comes from filter; in search mode, from result
    const mediaType = item.media_type || filters.mediaType;

    setSelectedMedia({
      tmdbId: item.id,
      mediaType,
      title: mediaTitle,
      posterPath,
      voteAverage: item.vote_average,
    });
  };

  // Combine results based on mode
  const displayResults = useMemo(() => {
    if (isSearchMode) {
      return searchResults
        .filter((r) => r.media_type === filters.mediaType)
        .map((r) => ({
          id: r.id,
          title: r.title,
          name: r.name,
          poster_path: r.poster_path,
          media_type: r.media_type as "movie" | "tv",
          vote_average: r.vote_average,
          release_date: r.release_date,
          first_air_date: r.first_air_date,
        }));
    }

    // Flatten all pages from the discover infinite query
    if (!discoverData?.pages) return [];
    return discoverData.pages.flatMap((page) =>
      page.results.map((r) => ({
        id: r.id,
        title: r.title,
        name: r.name,
        poster_path: r.poster_path,
        media_type: filters.mediaType,
        vote_average: r.vote_average,
        release_date: r.release_date,
        first_air_date: r.first_air_date,
      }))
    );
  }, [isSearchMode, searchResults, discoverData, filters.mediaType]);

  const isLoading = isSearchMode ? searchLoading : discoverLoading;

  const totalResults = useMemo(() => {
    if (isSearchMode) return searchTotalResults;
    return discoverData?.pages?.[0]?.total_results || 0;
  }, [isSearchMode, searchTotalResults, discoverData]);

  // Whether advanced filters (beyond media type) are applicable in current mode
  const filtersDisabled = isSearchMode;

  // Filter sidebar content (shared between desktop and mobile)
  const filterContent = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        {hasActiveFilters && !isSearchMode && (
          <button
            onClick={resetFilters}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Media Type Toggle - always available, applies to all modes */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Media Type
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMediaType("movie")}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              filters.mediaType === "movie"
                ? "bg-accent-primary text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setMediaType("tv")}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              filters.mediaType === "tv"
                ? "bg-accent-primary text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
            }`}
          >
            TV Series
          </button>
        </div>
      </div>

      {/* Search mode hint */}
      {isSearchMode && (
        <div className="rounded-lg bg-gray-800/60 border border-gray-700 px-3 py-2.5">
          <p className="text-xs text-gray-400">
            Clear the search to use advanced filters.
          </p>
        </div>
      )}

      {/* Sort By */}
      {!isSearchMode && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Sort By
          </h3>
          <SortByDropdown value={filters.sortBy} onChange={setSortBy} />
        </div>
      )}

      {/* Advanced filters - only shown when not in search mode */}
      {!filtersDisabled && (
        <>
          {/* Genres */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Genres
              </h3>
              {filters.genreIds.length > 0 && (
                <button
                  onClick={() => clearGenres()}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <GenreCheckboxList
              mediaType={filters.mediaType}
              selectedGenreIds={filters.genreIds}
              onToggleGenre={toggleGenre}
            />
          </div>

          {/* Year Range */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Year
              </h3>
              {(filters.releaseYearRange.min || filters.releaseYearRange.max) && (
                <button
                  onClick={() => clearReleaseYearRange()}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <YearRangeSelector
              value={filters.releaseYearRange}
              onChange={setReleaseYearRange}
            />
          </div>

          {/* Rating Slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Minimum Rating
              </h3>
              {filters.minRating > 0 && (
                <button
                  onClick={() => clearMinRating()}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <RatingSlider value={filters.minRating} onChange={setMinRating} />
          </div>

          {/* Runtime (Movies only) */}
          {filters.mediaType === "movie" && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Runtime
                </h3>
                {(filters.runtimeRange.min || filters.runtimeRange.max) && (
                  <button
                    onClick={() => clearRuntimeRange()}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <RuntimeSelector
                value={filters.runtimeRange}
                onChange={setRuntimeRange}
              />
            </div>
          )}

          {/* Language */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Language
              </h3>
              {filters.language && (
                <button
                  onClick={() => clearLanguage()}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <LanguageDropdown value={filters.language} onChange={setLanguage} />
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
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
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-gray-900 border border-gray-700 shadow-xl transition-all max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-white">
                        {title}
                      </Dialog.Title>
                      <p className="text-sm text-gray-400">
                        Find your next watch with guided filters
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-2 min-w-11 min-h-11 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Main Content */}
                  <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Desktop only */}
                    <div className="hidden lg:block w-72 border-r border-gray-700 p-4 overflow-y-auto">
                      {filterContent}
                    </div>

                    {/* Main Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Search Bar */}
                      <div className="p-4">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search movies and TV shows..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                          />
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex pl-4 border-b border-gray-700">
                        <div className="flex items-center gap-3">
                          {/* Mobile filter button - hidden during search mode */}
                          {!isSearchMode && (
                            <button
                              onClick={() => setMobileFiltersOpen(true)}
                              className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
                            >
                              <FaFilter className="text-xs" />
                              Filters
                              {hasActiveFilters && (
                                <span className="w-2 h-2 bg-accent-primary rounded-full" />
                              )}
                            </button>
                          )}

                          <span className="text-sm text-gray-400">
                            {totalResults.toLocaleString()} results
                          </span>
                        </div>
                      </div>

                      {/* Results Grid */}
                      <div ref={scrollContainerRef} className="flex-1 p-4 overflow-y-auto">
                        {isLoading ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <div
                                key={i}
                                className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse"
                              />
                            ))}
                          </div>
                        ) : searchError ? (
                          <div className="text-center py-12">
                            <p className="text-red-400">{searchError}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Please try again or use a different search term.
                            </p>
                          </div>
                        ) : displayResults.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-gray-400">
                              {isSearchMode && hasSearched
                                ? "No results found"
                                : "No results match your filters"}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {isSearchMode
                                ? "Try a different search term"
                                : "Try adjusting your filter settings"}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {displayResults.map((result) => {
                                const isAlreadyAdded = existingTmdbIds.has(result.id);
                                const mediaTitle =
                                  result.title || result.name || "Untitled";
                                const year =
                                  result.release_date?.slice(0, 4) ||
                                  result.first_air_date?.slice(0, 4);

                                return (
                                  <button
                                    key={`${result.media_type}-${result.id}`}
                                    type="button"
                                    onClick={() => handleCardClick(result)}
                                    className="group relative rounded-lg overflow-hidden bg-gray-800 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                                  >
                                    <Poster
                                      path={result.poster_path || undefined}
                                      alt={mediaTitle}
                                      className="w-full aspect-[2/3]"
                                      useCustomSize
                                    />

                                    {/* Already added indicator */}
                                    {isAlreadyAdded && (
                                      <div className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-green-600/90 text-white rounded">
                                        In List
                                      </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                      {/* Top badge - rating only */}
                                      <div className="flex justify-end">
                                        {result.vote_average !== undefined &&
                                          result.vote_average > 0 && (
                                            <RatingPill
                                              rating={result.vote_average}
                                              showOutOfTen={false}
                                              className="text-xs"
                                            />
                                          )}
                                      </div>

                                      {/* Bottom info */}
                                      <div>
                                        <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                                          {mediaTitle}
                                        </p>
                                        {year && (
                                          <p className="text-gray-400 text-xs">
                                            {year}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Infinite scroll sentinel and loading indicator */}
                            <div
                              ref={loadMoreRef}
                              className="py-8 flex justify-center"
                            >
                              {isFetchingNextPage && (
                                <div className="flex items-center gap-2 text-gray-400">
                                  <div className="w-5 h-5 border-2 border-gray-600 border-t-accent-primary rounded-full animate-spin" />
                                  <span className="text-sm">Loading more...</span>
                                </div>
                              )}
                              {!hasNextPage && displayResults.length > 0 && (
                                <span className="text-sm text-gray-500">
                                  No more results
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
      >
        {filterContent}
      </MobileFilterDrawer>

      {/* Add to List Modal */}
      {selectedMedia && (
        <AddToListModal
          isOpen={selectedMedia !== null}
          onClose={() => setSelectedMedia(null)}
          media={selectedMedia}
        />
      )}
    </>
  );
}
