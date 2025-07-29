import { useState, useCallback } from "react";
import axios from "axios";

// Define proper types for search results
interface SearchResult {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
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
  hasSearched: boolean;
}

export function useSearch() {
  const [state, setState] = useState<UseSearchState>({
    results: [],
    loading: false,
    error: null,
    totalResults: 0,
    hasSearched: false
  });

  const search = useCallback(async (query: string, page: number = 1) => {
    // Early return for empty queries
    if (!query.trim()) {
      setState(prev => ({ ...prev, results: [], hasSearched: false, error: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Use your backend API endpoint
      const response = await axios.get<SearchResponse>(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/Movies/search/multi`,
        {
          params: { 
            query: query.trim(),
            page 
          }
        }
      );

      const data = response.data;

      setState(prev => ({
        ...prev,
        results: data.results || [],
        totalResults: data.total_results || 0,
        loading: false,
        hasSearched: true,
        error: null
      }));

    } catch (err) {
      console.error("Search error:", err);
      
      let errorMessage = "Something went wrong with the search.";
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          errorMessage = "Search service not found.";
        } else if (err.response && typeof err.response.status === "number" && err.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (err.code === 'NETWORK_ERROR') {
          errorMessage = "Network error. Please check your connection.";
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        results: [],
        totalResults: 0,
        hasSearched: true
      }));
    }
  }, []);

  const clearSearch = useCallback(() => {
    setState({
      results: [],
      loading: false,
      error: null,
      totalResults: 0,
      hasSearched: false
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    search,
    clearSearch,
    clearError
  };
}
