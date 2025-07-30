// components/SearchBar.tsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSearch } from "../../hooks/useSearch";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { results, search, loading, error, hasSearched, totalResults, clearSearch } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search(query);
      setIsOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Search as user types (debounced effect can be added)
    if (value.trim()) {
      search(value);
      setIsOpen(true);
    } else {
      clearSearch();
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    clearSearch();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getResultLink = (result: any) => {
    if (result.media_type === 'person') {
      return `/person/${result.id}/${result.name?.toLowerCase().split(" ").join("-") || 'unknown'}`;
    }
    return `/media/${result.media_type}/${result.id}`;
  };

  const getResultImage = (result: any) => {
    const imagePath = result.poster_path || result.profile_path;
    return imagePath 
      ? `https://image.tmdb.org/t/p/w92${imagePath}`
      : '/placeholder-poster.png';
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Titles, people, genres..."
            value={query}
            onChange={handleInputChange}
            className="w-80 md:w-96 lg:w-[32rem] bg-gray-900/40 border border-gray-600 rounded-full px-4 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-sky-500"
          />
          
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " 
          />
          
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (query.trim() || hasSearched) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800/80 backdrop-blur-md border border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-400">
              <FontAwesomeIcon icon={faSearch} className="animate-spin mr-2" />
              Searching...
            </div>
          )}

          {error && (
            <div className="p-4 text-red-400 text-center">
              {error}
            </div>
          )}

          {!loading && !error && hasSearched && (
            <>
              {totalResults > 0 && (
                <div className="p-2 text-xs text-gray-400 border-b border-gray-700">
                  {totalResults} result{totalResults !== 1 ? 's' : ''} found
                </div>
              )}

              {results.length > 0 ? (
                <ul className="py-2">
                  {results.slice(0, 8).map((result) => (
                    <li key={`${result.media_type}-${result.id}`}>
                      <Link
                        to={getResultLink(result)}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-sky-500/20 transition-colors group duration-200"
                      >
                        <img
                          src={getResultImage(result)}
                          alt={result.title || result.name}
                          className="w-8 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate group-hover:text-sky-300 transition-colors duration-200">
                            {result.title || result.name}
                          </p>
                          <p className="text-xs text-gray-400 capitalize transition-colors">
                            {result.media_type === 'tv' ? 'TV Show' : result.media_type}
                            {result.release_date && ` • ${new Date(result.release_date).getFullYear()}`}
                            {result.first_air_date && ` • ${new Date(result.first_air_date).getFullYear()}`}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No results found for "{query}"
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

















