import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { api } from "../api/http/axios";

// Define proper types for search results
interface SearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path?: string;
  profile_path?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  known_for_department?: string;
}

interface SearchResponse {
  results: SearchResult[];
  total_pages: number;
  total_results: number;
  page: number;
}

interface UseSearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  totalPages: number;
  currentPage: number;
  hasSearched: boolean;
}

export function useSearch() {
  const [state, setState] = useState<UseSearchState>({
    results: [],
    loading: false,
    error: null,
    totalResults: 0,
    totalPages: 0,
    currentPage: 0,
    hasSearched: false,
  });

  // AbortController ref to cancel in-flight requests on new search
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track current query for fetchNextPage
  const currentQueryRef = useRef<string>("");
  // Track if a "next page" load is in progress (separate from initial loading)
  const [loadingNextPage, setLoadingNextPage] = useState(false);

  const search = useCallback(async (query: string, page: number = 1) => {
    // Early return for empty queries
    if (!query.trim()) {
      setState((prev) => ({
        ...prev,
        results: [],
        hasSearched: false,
        error: null,
      }));
      return;
    }

    // Cancel any in-flight request before starting a new one
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Track query for fetchNextPage
    if (page === 1) currentQueryRef.current = query.trim();

    const isNextPage = page > 1;
    if (isNextPage) {
      setLoadingNextPage(true);
    } else {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    try {
      const response = await api.get<SearchResponse>(
        "/api/Movies/search/multi",
        {
          params: {
            query: query.trim(),
            page,
          },
          signal: controller.signal,
        }
      );

      const data = response.data;

      // If this request was aborted while in-flight, don't apply results
      if (controller.signal.aborted) return;

      setLoadingNextPage(false);
      setState((prev) => ({
        ...prev,
        // Append results for page > 1 (infinite scroll), replace for page 1
        results: isNextPage ? [...prev.results, ...(data.results || [])] : (data.results || []),
        totalResults: data.total_results || 0,
        totalPages: data.total_pages || 0,
        currentPage: data.page || page,
        loading: false,
        hasSearched: true,
        error: null,
      }));
    } catch (err) {
      // Don't update state if the request was intentionally cancelled
      if (axios.isCancel(err)) return;

      console.error("Search error:", err);

      let errorMessage = "Something went wrong with the search.";

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          errorMessage = "Search service not found.";
        } else if (
          err.response &&
          typeof err.response.status === "number" &&
          err.response.status >= 500
        ) {
          errorMessage = "Server error. Please try again later.";
        } else if (err.code === "ERR_NETWORK") {
          errorMessage = "Network error. Please check your connection.";
        }
      }

      setLoadingNextPage(false);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        // Only clear results on page 1 error; keep existing results if next-page fails
        results: isNextPage ? prev.results : [],
        totalResults: isNextPage ? prev.totalResults : 0,
        totalPages: isNextPage ? prev.totalPages : 0,
        currentPage: isNextPage ? prev.currentPage : 0,
        hasSearched: true,
      }));
    }
  }, []);

  const hasNextPage = state.currentPage > 0 && state.currentPage < state.totalPages;

  const fetchNextPage = useCallback(() => {
    if (!currentQueryRef.current || loadingNextPage) return;
    search(currentQueryRef.current, state.currentPage + 1);
  }, [search, state.currentPage, loadingNextPage]);

  const clearSearch = useCallback(() => {
    // Cancel any pending request when clearing
    abortControllerRef.current?.abort();
    setState({
      results: [],
      loading: false,
      error: null,
      totalResults: 0,
      totalPages: 0,
      currentPage: 0,
      hasSearched: false,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    search,
    clearSearch,
    clearError,
    hasNextPage,
    fetchNextPage,
    loadingNextPage,
  };
}
