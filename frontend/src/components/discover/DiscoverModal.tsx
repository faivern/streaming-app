import { Fragment, useState, useEffect, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FaTimes,
  FaSearch,
  FaPlus,
  FaCheck,
  FaDice,
  FaFilter,
} from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { useSearch } from "../../hooks/useSearch";
import { useAdvancedDiscover, advancedDiscoverKeys } from "../../hooks/discover/useAdvancedDiscover";
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

type DiscoverModalProps = {
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

export default function DiscoverModal({
  isOpen,
  onClose,
  onAdd,
  existingTmdbIds = new Set(),
  title = "Discover",
}: DiscoverModalProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  // Build discover params from filters (for movie and tv separately when "both")
  const movieParams: AdvancedDiscoverParams = useMemo(
    () => ({
      mediaType: "movie",
      genreIds: filters.genreIds.length > 0 ? filters.genreIds : undefined,
      primaryReleaseYearGte: filters.releaseYearRange.min,
      primaryReleaseYearLte: filters.releaseYearRange.max,
      voteAverageGte: filters.minRating > 0 ? filters.minRating : undefined,
      runtimeGte: filters.runtimeRange.min,
      runtimeLte: filters.runtimeRange.max,
      language: filters.language || undefined,
      sortBy: filters.sortBy,
      page: 1,
    }),
    [filters]
  );

  const tvParams: AdvancedDiscoverParams = useMemo(
    () => ({
      mediaType: "tv",
      genreIds: filters.genreIds.length > 0 ? filters.genreIds : undefined,
      primaryReleaseYearGte: filters.releaseYearRange.min,
      primaryReleaseYearLte: filters.releaseYearRange.max,
      voteAverageGte: filters.minRating > 0 ? filters.minRating : undefined,
      language: filters.language || undefined,
      sortBy: filters.sortBy,
      page: 1,
    }),
    [filters]
  );

  // Discover queries - run both when "both" is selected
  const isBothMode = filters.mediaType === "both";

  const {
    data: movieData,
    isLoading: movieLoading,
    refetch: refetchMovies,
  } = useAdvancedDiscover(movieParams, {
    enabled: isOpen && !isSearchMode && (filters.mediaType === "movie" || isBothMode)
  });

  const {
    data: tvData,
    isLoading: tvLoading,
    refetch: refetchTv,
  } = useAdvancedDiscover(tvParams, {
    enabled: isOpen && !isSearchMode && (filters.mediaType === "tv" || isBothMode)
  });

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
    setAddedIds(new Set());
    setIsSearchMode(false);
    onClose();
  };

  const handleAdd = (item: {
    id: number;
    title?: string;
    name?: string;
    poster_path?: string | null;
    media_type?: string;
  }) => {
    const mediaTitle = item.title || item.name || "Untitled";
    const posterPath = item.poster_path || null;
    // In discover mode, media_type comes from filter; in search mode, from result
    const mediaType = item.media_type || filters.mediaType;

    onAdd({
      tmdbId: item.id,
      mediaType,
      title: mediaTitle,
      posterPath,
    });

    setAddedIds((prev) => new Set(prev).add(item.id));
  };

  const handleAddAll = () => {
    if (!displayResults) return;
    displayResults.forEach((item) => {
      if (!existingTmdbIds.has(item.id) && !addedIds.has(item.id)) {
        handleAdd(item);
      }
    });
  };

  const handleReroll = () => {
    // Invalidate cache and refetch to get fresh results
    if (filters.mediaType === "movie" || isBothMode) {
      queryClient.invalidateQueries({
        queryKey: advancedDiscoverKeys.filters(movieParams),
      });
      refetchMovies();
    }
    if (filters.mediaType === "tv" || isBothMode) {
      queryClient.invalidateQueries({
        queryKey: advancedDiscoverKeys.filters(tvParams),
      });
      refetchTv();
    }
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

    // Handle "both" mode by merging and interleaving results
    if (isBothMode) {
      const movies = (movieData?.results || []).map((r) => ({
        id: r.id,
        title: r.title,
        name: r.name,
        poster_path: r.poster_path,
        media_type: "movie" as const,
        vote_average: r.vote_average,
        release_date: r.release_date,
        first_air_date: r.first_air_date,
      }));
      const tvShows = (tvData?.results || []).map((r) => ({
        id: r.id,
        title: r.title,
        name: r.name,
        poster_path: r.poster_path,
        media_type: "tv" as const,
        vote_average: r.vote_average,
        release_date: r.release_date,
        first_air_date: r.first_air_date,
      }));

      // Interleave results for variety
      type ResultItem = (typeof movies)[number] | (typeof tvShows)[number];
      const merged: ResultItem[] = [];
      const maxLen = Math.max(movies.length, tvShows.length);
      for (let i = 0; i < maxLen; i++) {
        if (i < movies.length) merged.push(movies[i]);
        if (i < tvShows.length) merged.push(tvShows[i]);
      }
      return merged;
    }

    // Single media type mode
    const data = filters.mediaType === "movie" ? movieData : tvData;
    return (
      data?.results.map((r) => ({
        id: r.id,
        title: r.title,
        name: r.name,
        poster_path: r.poster_path,
        media_type: filters.mediaType as "movie" | "tv",
        vote_average: r.vote_average,
        release_date: r.release_date,
        first_air_date: r.first_air_date,
      })) || []
    );
  }, [isSearchMode, searchResults, movieData, tvData, filters.mediaType, isBothMode]);

  const discoverLoading = isBothMode
    ? movieLoading || tvLoading
    : filters.mediaType === "movie"
      ? movieLoading
      : tvLoading;

  const isLoading = isSearchMode ? searchLoading : discoverLoading;

  const totalResults = useMemo(() => {
    if (isSearchMode) return searchResults.length;
    if (isBothMode) {
      return (movieData?.total_results || 0) + (tvData?.total_results || 0);
    }
    return filters.mediaType === "movie"
      ? movieData?.total_results || 0
      : tvData?.total_results || 0;
  }, [isSearchMode, searchResults.length, movieData, tvData, filters.mediaType, isBothMode]);

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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMediaType("movie")}
            className={`flex-1 min-w-[70px] px-3 py-2 text-sm rounded-lg transition-colors ${
              filters.mediaType === "movie"
                ? "bg-accent-primary text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setMediaType("tv")}
            className={`flex-1 min-w-[70px] px-3 py-2 text-sm rounded-lg transition-colors ${
              filters.mediaType === "tv"
                ? "bg-accent-primary text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
            }`}
          >
            TV Series
          </button>
          <button
            onClick={() => setMediaType("both")}
            className={`flex-1 min-w-[70px] px-3 py-2 text-sm rounded-lg transition-colors ${
              filters.mediaType === "both"
                ? "bg-accent-primary text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
            }`}
          >
            Both
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
                      <div className="p-4 border-b border-gray-700">
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
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800/50">
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

                          {!isSearchMode && (
                            <button
                              onClick={handleReroll}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors"
                            >
                              <FaDice />
                              Re-roll
                            </button>
                          )}
                          <span className="text-sm text-gray-400">
                            {totalResults.toLocaleString()} results
                          </span>
                        </div>

                        <button
                          onClick={handleAddAll}
                          disabled={displayResults.length === 0}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent-primary hover:bg-accent-primary/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FaPlus className="text-xs" />
                          Add All to List
                        </button>
                      </div>

                      {/* Results Grid */}
                      <div className="flex-1 p-4 overflow-y-auto">
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
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {displayResults.map((result) => {
                              const isAlreadyAdded =
                                existingTmdbIds.has(result.id) ||
                                addedIds.has(result.id);
                              const mediaTitle =
                                result.title || result.name || "Untitled";
                              const year =
                                result.release_date?.slice(0, 4) ||
                                result.first_air_date?.slice(0, 4);

                              return (
                                <div
                                  key={result.id}
                                  className="group relative rounded-lg overflow-hidden bg-gray-800"
                                >
                                  <Poster
                                    path={result.poster_path || undefined}
                                    alt={mediaTitle}
                                    className="w-full aspect-[2/3]"
                                    useCustomSize
                                  />

                                  {/* Hover Overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                                    {/* Top badges */}
                                    <div className="flex items-start justify-between">
                                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-900/80 text-gray-300 rounded">
                                        {result.media_type === "movie"
                                          ? "Movie"
                                          : "TV"}
                                      </span>
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
                                        <p className="text-gray-400 text-xs mb-2">
                                          {year}
                                        </p>
                                      )}
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
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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
    </>
  );
}
