// components/SearchBar.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../hooks/useSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Combobox } from "@headlessui/react";
import Poster from "../media/shared/Poster";

type SearchBarProps = {
  isMobile?: boolean;
  onToggle?: () => void;
  isExpanded?: boolean;
};

export default function SearchBar({
  isMobile = false,
  onToggle,
  isExpanded = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const {
    results,
    search,
    loading,
    error,
    hasSearched,
    totalResults,
    clearSearch,
  } = useSearch();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when expanded on mobile
  useEffect(() => {
    if (isMobile && isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile, isExpanded]);

  // Only handle mobile overlay dismiss on outside click
  useEffect(() => {
    if (!isMobile || !isExpanded) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        onToggle?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile, isExpanded, onToggle]);

  const handleChange = (val: any) => {
    setSelected(val);
    if (isMobile) {
      onToggle?.();
    }
    // Navigate after selection
    const path =
      val.media_type === "person"
        ? `/person/${val.id}/${(val.name || "unknown")
            .toLowerCase()
            .split(" ")
            .join("-")}`
        : `/media/${val.media_type}/${val.id}`;
    navigate(path);
  };

  const handleInput = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      search(value);
    } else {
      clearSearch();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuery("");
    clearSearch();
    setSelected(null);
    if (isMobile) {
      onToggle?.();
    } else {
      inputRef.current?.focus();
    }
  };

  const showOptions = loading || error !== null || hasSearched;

  // Mobile: Just return search icon when collapsed
  if (isMobile && !isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="p-2 text-text-h1 hover:text-accent-primary transition"
        aria-label="Open search"
      >
        <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
      </button>
    );
  }

  // Mobile: Full screen overlay when expanded
  if (isMobile && isExpanded) {
    return (
      <div className="fixed inset-0 z-(--z-searchbar) bg-component-primary/95 backdrop-blur-lg">
        <div className="flex items-center p-4 border-b border-border">
          <div className="flex-1 relative" ref={searchRef}>
            <Combobox value={selected} onChange={handleChange} nullable immediate>
              <div className="relative">
                <Combobox.Input
                  ref={inputRef}
                  className="w-full bg-input border border-outline rounded-full px-4 py-3 pl-12 pr-12 text-text-h1 placeholder-subtle focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
                  placeholder="Search Movies, TV Shows, People..."
                  displayValue={() => query}
                  onChange={(e) => handleInput(e.target.value)}
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
                />
                {query && (
                  <button
                    type="button"
                    onMouseDown={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle hover:text-text-h1 transition-colors duration-200 p-1"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>

              {showOptions && (
                <Combobox.Options className="absolute top-full left-0 right-0 mt-2 bg-action-primary border border-outline rounded-lg shadow-xl max-h-96 overflow-y-auto focus:outline-none">
                  {loading && (
                    <div className="p-4 text-center text-subtle">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="animate-spin mr-2"
                      />
                      Searching...
                    </div>
                  )}

                  {error && (
                    <div className="p-4 text-red-400 text-center">{error}</div>
                  )}

                  {!loading && !error && hasSearched && (
                    <>
                      {totalResults > 0 && (
                        <div className="p-3 text-xs text-subtle border-b border-border">
                          {totalResults} result{totalResults !== 1 ? "s" : ""}{" "}
                          found
                        </div>
                      )}

                      {results.length > 0 ? (
                        results.slice(0, 12).map((r: any) => (
                          <Combobox.Option
                            key={`${r.media_type}-${r.id}`}
                            value={r}
                            className={({ active }) =>
                              `flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
                                active
                                  ? "bg-accent-primary/20 text-text-h1"
                                  : "text-subtle"
                              }`
                            }
                          >
                            {({ active }) => (
                              <>
                                <Poster
                                  path={r.poster_path || r.profile_path}
                                  alt={r.title || r.name}
                                  useCustomSize
                                  className="w-10 h-14 rounded flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`font-medium truncate ${
                                      active ? "text-text-h1" : "text-subtle"
                                    }`}
                                  >
                                    {r.title || r.name}
                                  </p>
                                  <p className="text-sm text-subtle capitalize truncate">
                                    {r.media_type === "tv"
                                      ? "TV Show"
                                      : r.media_type}
                                    {r.release_date &&
                                      ` • ${new Date(
                                        r.release_date
                                      ).getFullYear()}`}
                                    {r.first_air_date &&
                                      ` • ${new Date(
                                        r.first_air_date
                                      ).getFullYear()}`}
                                  </p>
                                </div>
                              </>
                            )}
                          </Combobox.Option>
                        ))
                      ) : (
                        <div className="p-4 text-center text-subtle">
                          No results for "{query}"
                        </div>
                      )}
                    </>
                  )}
                </Combobox.Options>
              )}
            </Combobox>
          </div>

          <button
            onClick={onToggle}
            className="ml-4 p-2 text-subtle hover:text-text-h1 transition"
            aria-label="Close search"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Desktop: Regular search bar
  return (
    <div className="relative w-full" ref={searchRef}>
      <Combobox value={selected} onChange={handleChange} nullable immediate>
        <div className="relative">
          <Combobox.Input
            ref={inputRef}
            className="w-full bg-input border-2 border-outline rounded-full px-4 py-2.5 pl-10 pr-10 text-text-h1 placeholder-subtle focus:outline-none focus:border-accent-secondary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200 text-sm md:text-base"
            placeholder="Search Movies, TV Shows, People..."
            displayValue={() => query}
            onChange={(e) => handleInput(e.target.value)}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-sm"
          />
          {query && (
            <button
              type="button"
              onMouseDown={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-text-h1 transition-colors duration-200 p-1"
            >
              <FontAwesomeIcon icon={faTimes} className="text-sm" />
            </button>
          )}
        </div>

        {showOptions && (
          <Combobox.Options className="absolute top-full left-0 right-0 mt-1 bg-component-primary/95 backdrop-blur-lg border border-outline rounded-lg shadow-xl z-(--z-overlay) max-h-96 overflow-y-auto focus:outline-none text-sm">
            {loading && (
              <div className="p-4 text-center text-subtle">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="animate-spin mr-2"
                />
                Searching...
              </div>
            )}

            {error && (
              <div className="p-4 text-red-400 text-center">{error}</div>
            )}

            {!loading && !error && hasSearched && (
              <>
                {totalResults > 0 && (
                  <div className="p-2 text-xs text-subtle border-b border-border">
                    {totalResults} result{totalResults !== 1 ? "s" : ""} found
                  </div>
                )}

                {results.length > 0 ? (
                  results.slice(0, 12).map((r: any) => (
                    <Combobox.Option
                      key={`${r.media_type}-${r.id}`}
                      value={r}
                      className={({ active }) =>
                        `flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors duration-150 ${
                          active
                            ? "bg-accent-primary/20 text-text-h1"
                            : "text-subtle"
                        }`
                      }
                    >
                      {({ active }) => (
                        <>
                          <Poster
                            path={r.poster_path || r.profile_path}
                            alt={r.title || r.name}
                            useCustomSize
                            className="w-8 h-12 rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium truncate ${
                                active ? "text-text-h1" : "text-subtle"
                              }`}
                            >
                              {r.title || r.name}
                            </p>
                            <p className="text-xs text-subtle capitalize truncate">
                              {r.media_type === "tv" ? "TV Show" : r.media_type}
                              {r.release_date &&
                                ` • ${new Date(r.release_date).getFullYear()}`}
                              {r.first_air_date &&
                                ` • ${new Date(
                                  r.first_air_date
                                ).getFullYear()}`}
                            </p>
                          </div>
                        </>
                      )}
                    </Combobox.Option>
                  ))
                ) : (
                  <div className="p-4 text-center text-subtle">
                    No results for "{query}"
                  </div>
                )}
              </>
            )}
          </Combobox.Options>
        )}
      </Combobox>
    </div>
  );
}
