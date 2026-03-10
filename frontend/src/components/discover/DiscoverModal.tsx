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
import MediaCard from "../media/cards/MediaCard";
import MediaCardSkeleton from "../media/skeleton/MediaCardSkeleton";
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
import { useUser } from "../../hooks/user/useUser";
import { useSignInModal } from "../../context/SignInModalContext";

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
  const { data: user } = useUser();
  const { openSignInModal } = useSignInModal();

  // Callback ref for infinite scroll sentinel — using state ensures a re-render
  // (and thus a fresh effect run) whenever the sentinel mounts/unmounts,
  // which fixes the stale-observer bug when reopening the modal.
  const [sentinelNode, setSentinelNode] = useState<HTMLDivElement | null>(null);
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinelNode(node);
  }, []);
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
  // Depends on sentinelNode (set via callback ref) so it re-runs reliably
  // whenever the sentinel DOM element mounts after the Transition opens.
  useEffect(() => {
    if (!sentinelNode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          handleLoadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(sentinelNode);
    return () => observer.disconnect();
  }, [sentinelNode, hasNextPage, isFetchingNextPage, handleLoadMore]);

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
    if (!user) {
      openSignInModal();
      return;
    }

    const mediaTitle = item.title || item.name || "Untitled";
    const posterPath = item.poster_path || null;
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
        <h3 className="text-lg font-semibold text-text-h1">Filters</h3>
        {hasActiveFilters && !isSearchMode && (
          <button
            onClick={resetFilters}
            className="px-3 py-1 text-sm text-subtle hover:text-text-h1 bg-action-primary hover:bg-action-hover rounded-lg transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Media Type Toggle - always available, applies to all modes */}
      <div>
        <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">
          Media Type
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMediaType("movie")}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              filters.mediaType === "movie"
                ? "bg-accent-primary text-text-h1"
                : "bg-action-primary text-text-h1 hover:bg-action-hover"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setMediaType("tv")}
            className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              filters.mediaType === "tv"
                ? "bg-accent-primary text-text-h1"
                : "bg-action-primary text-text-h1 hover:bg-action-hover"
            }`}
          >
            TV Series
          </button>
        </div>
      </div>

      {/* Search mode hint */}
      {isSearchMode && (
        <div className="rounded-lg bg-component-primary/60 border border-outline px-3 py-2.5">
          <p className="text-xs text-subtle">
            Clear the search to use advanced filters.
          </p>
        </div>
      )}

      {/* Sort By */}
      {!isSearchMode && (
        <div>
          <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider mb-3">
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
              <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider">
                Genres
              </h3>
              {filters.genreIds.length > 0 && (
                <button
                  onClick={() => clearGenres()}
                  className="text-xs text-subtle hover:text-text-h1 transition-colors"
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
              <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider">
                Year
              </h3>
              {(filters.releaseYearRange.min || filters.releaseYearRange.max) && (
                <button
                  onClick={() => clearReleaseYearRange()}
                  className="text-xs text-subtle hover:text-text-h1 transition-colors"
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
              <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider">
                Minimum Rating
              </h3>
              {filters.minRating > 0 && (
                <button
                  onClick={() => clearMinRating()}
                  className="text-xs text-subtle hover:text-text-h1 transition-colors"
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
                <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider">
                  Runtime
                </h3>
                {(filters.runtimeRange.min || filters.runtimeRange.max) && (
                  <button
                    onClick={() => clearRuntimeRange()}
                    className="text-xs text-subtle hover:text-text-h1 transition-colors"
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
              <h3 className="text-xs font-semibold text-subtle uppercase tracking-wider">
                Language
              </h3>
              {filters.language && (
                <button
                  onClick={() => clearLanguage()}
                  className="text-xs text-subtle hover:text-text-h1 transition-colors"
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

          <div className="fixed inset-0">
            <div className="flex h-full items-end sm:items-center justify-center sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
                enterTo="translate-y-0 sm:scale-100 opacity-100"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-y-0 sm:scale-100 opacity-100"
                leaveTo="translate-y-full sm:translate-y-0 sm:scale-95 opacity-0"
              >
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-component-primary border border-outline shadow-xl transition-all max-h-[95dvh] sm:max-h-[90dvh] flex flex-col pb-safe sm:pb-0">
                  {/* Mobile drag handle */}
                  <div className="flex justify-center pt-2 pb-1 sm:hidden">
                    <div className="w-10 h-1 bg-outline rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-outline">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-text-h1">
                        {title}
                      </Dialog.Title>
                      <p className="text-sm text-subtle">
                        Find your next watch with guided filters
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-2 min-w-11 min-h-11 flex items-center justify-center text-subtle hover:text-text-h1 rounded-lg hover:bg-action-hover transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Main Content */}
                  <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Desktop only */}
                    <div className="hidden lg:block w-72 border-r border-outline p-4 overflow-y-auto">
                      {filterContent}
                    </div>

                    {/* Main Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Search Bar */}
                      <div className="p-4">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search movies and TV shows..."
                            className="w-full pl-10 pr-4 py-2.5 bg-input border border-outline rounded-lg text-text-h1 placeholder-subtle focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                            onFocus={(e) => {
                              // After the virtual keyboard animates in (~300ms), scroll the input into view
                              setTimeout(() => {
                                (e.target as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                              }, 300);
                            }}
                          />
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex pl-4 border-b border-outline">
                        <div className="flex items-center gap-3">
                          {/* Mobile filter button - hidden during search mode */}
                          {!isSearchMode && (
                            <button
                              onClick={() => setMobileFiltersOpen(true)}
                              className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm bg-action-primary text-text-h1 rounded-lg hover:bg-action-hover transition-colors"
                            >
                              <FaFilter className="text-xs" />
                              Filters
                              {hasActiveFilters && (
                                <span className="w-2 h-2 bg-accent-primary rounded-full" />
                              )}
                            </button>
                          )}

                          <span className="text-sm text-subtle">
                            {totalResults.toLocaleString()} results
                          </span>
                        </div>
                      </div>

                      {/* Results Grid */}
                      <div ref={scrollContainerRef} className="flex-1 p-4 overflow-y-auto overscroll-contain">
                        {isLoading ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <MediaCardSkeleton key={i} />
                            ))}
                          </div>
                        ) : searchError ? (
                          <div className="text-center py-12">
                            <p className="text-red-400">{searchError}</p>
                            <p className="text-sm text-subtle mt-1">
                              Please try again or use a different search term.
                            </p>
                          </div>
                        ) : displayResults.length === 0 ? (
                          <div className="text-center py-12">
                            <p className="text-subtle">
                              {isSearchMode && hasSearched
                                ? "No results found"
                                : "No results match your filters"}
                            </p>
                            <p className="text-sm text-subtle mt-1">
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

                                return (
                                  <div
                                    key={`${result.media_type}-${result.id}`}
                                    className="relative"
                                  >
                                    {isAlreadyAdded && (
                                      <div className="absolute top-2 right-2 z-20 px-2 py-0.5 text-xs font-medium bg-green-600/90 text-white rounded">
                                        In List
                                      </div>
                                    )}
                                    <MediaCard
                                      id={result.id}
                                      media_type={result.media_type}
                                      title={result.title || result.name || "Untitled"}
                                      posterPath={result.poster_path || ""}
                                      vote_average={result.vote_average}
                                      releaseDate={result.release_date || result.first_air_date}
                                      disableHoverModal
                                      showQuickAdd={false}
                                      onClick={() => handleCardClick(result)}
                                    />
                                  </div>
                                );
                              })}
                            </div>

                            {/* Infinite scroll sentinel and loading indicator */}
                            <div
                              ref={sentinelRef}
                              className="py-8 flex justify-center"
                            >
                              {isFetchingNextPage && (
                                <div className="flex items-center gap-2 text-subtle">
                                  <div className="w-5 h-5 border-2 border-outline border-t-accent-primary rounded-full animate-spin" />
                                  <span className="text-sm">Loading more...</span>
                                </div>
                              )}
                              {!hasNextPage && displayResults.length > 0 && (
                                <span className="text-sm text-subtle">
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

      {/* Add to List Modal – always mounted to avoid expensive remount delay */}
      <AddToListModal
        isOpen={selectedMedia !== null}
        onClose={() => setSelectedMedia(null)}
        media={selectedMedia ?? { tmdbId: 0, mediaType: "movie", title: "", posterPath: null }}
      />
    </>
  );
}
