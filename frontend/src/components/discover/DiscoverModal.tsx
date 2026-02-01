import { Fragment, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FaTimes,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { useSearch } from "../../hooks/useSearch";
import { useInfiniteAdvancedDiscover } from "../../hooks/discover/useInfiniteAdvancedDiscover";
import { useInfiniteTrending } from "../../hooks/discover/useInfiniteTrending";
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
    setReleaseYearRange,
    setMinRating,
    setRuntimeRange,
    setLanguage,
    setSortBy,
    resetFilters,
    hasActiveFilters,
  } = useDiscoverFilters();

  // Search hook for search mode
  const {
    results: searchResults,
    loading: searchLoading,
    search,
    clearSearch,
    hasSearched,
  } = useSearch();

  // Check if we're using the trending API
  const isTrendingMode = filters.sortBy === "trending";

  // Build discover params from current filter state (used when not in trending mode)
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

  // Infinite query for discover mode (non-trending)
  const {
    data: discoverData,
    isLoading: discoverLoading,
    isFetchingNextPage: discoverFetchingNext,
    hasNextPage: discoverHasNext,
    fetchNextPage: discoverFetchNext,
  } = useInfiniteAdvancedDiscover(discoverParams, {
    enabled: isOpen && !isSearchMode && !isTrendingMode,
  });

  // Infinite query for trending mode
  const {
    data: trendingData,
    isLoading: trendingLoading,
    isFetchingNextPage: trendingFetchingNext,
    hasNextPage: trendingHasNext,
    fetchNextPage: trendingFetchNext,
  } = useInfiniteTrending(
    { mediaType: filters.mediaType },
    { enabled: isOpen && !isSearchMode && isTrendingMode }
  );

  // Unified pagination state based on mode
  const isFetchingNextPage = isTrendingMode ? trendingFetchingNext : discoverFetchingNext;
  const hasNextPage = isTrendingMode ? trendingHasNext : discoverHasNext;
  const fetchNextPage = isTrendingMode ? trendingFetchNext : discoverFetchNext;

  // Load more when scrolling near the bottom
  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || isSearchMode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          handleLoadMore();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "200px", // Load more when within 200px of sentinel
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, handleLoadMore, isSearchMode, isOpen]);

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
        .filter((r) => r.media_type === "movie" || r.media_type === "tv")
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

    // Handle trending mode
    if (isTrendingMode) {
      if (!trendingData?.pages) return [];
      return trendingData.pages.flatMap((page) =>
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
  }, [isSearchMode, searchResults, isTrendingMode, trendingData, discoverData, filters.mediaType]);

  const isLoading = isSearchMode ? searchLoading : (isTrendingMode ? trendingLoading : discoverLoading);

  const totalResults = useMemo(() => {
    if (isSearchMode) return searchResults.length;
    if (isTrendingMode) return trendingData?.pages?.[0]?.total_results || 0;
    return discoverData?.pages?.[0]?.total_results || 0;
  }, [isSearchMode, searchResults.length, isTrendingMode, trendingData, discoverData]);

  // Filter sidebar content (shared between desktop and mobile)
  const filterContent = (
    <div className="space-y-6">
      {/* Genres */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Genres
        </h3>
        <GenreCheckboxList
          mediaType={filters.mediaType}
          selectedGenreIds={filters.genreIds}
          onToggleGenre={toggleGenre}
        />
      </div>

      {/* Year Range */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Year
        </h3>
        <YearRangeSelector
          value={filters.releaseYearRange}
          onChange={setReleaseYearRange}
        />
      </div>

      {/* Media Type Toggle */}
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

      {/* Rating Slider */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Minimum Rating
        </h3>
        <RatingSlider value={filters.minRating} onChange={setMinRating} />
      </div>

      {/* Sort By */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Sort By
        </h3>
        <SortByDropdown value={filters.sortBy} onChange={setSortBy} />
      </div>

      {/* Runtime (Movies only - not available for TV or Both) */}
      {filters.mediaType === "movie" && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Runtime
          </h3>
          <RuntimeSelector
            value={filters.runtimeRange}
            onChange={setRuntimeRange}
          />
        </div>
      )}

      {/* Language */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Language
        </h3>
        <LanguageDropdown value={filters.language} onChange={setLanguage} />
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Reset all filters
        </button>
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
                <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-700 shadow-xl transition-all max-h-[90vh] flex flex-col">
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
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
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
                          {/* Mobile filter button */}
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
                                    key={result.id}
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
                            {!isSearchMode && (
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
                            )}
                          </>
                        )}
                      </div>
                    </div>
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
