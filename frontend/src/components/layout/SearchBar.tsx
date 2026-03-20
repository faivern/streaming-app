// components/SearchBar.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "../../hooks/useSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
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
  const [activeIndex, setActiveIndex] = useState(-1);
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

  const showOptions = loading || error !== null || hasSearched;

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

  // Desktop: close dropdown on outside click
  useEffect(() => {
    if (isMobile) return;
    if (!showOptions) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setQuery("");
        clearSearch();
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
  }, [isMobile, showOptions, clearSearch]);

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0) {
      const prefix = isMobile ? "mobile" : "desktop";
      document
        .getElementById(`search-option-${prefix}-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isMobile]);

  const handleChange = (val: any) => {
    if (isMobile) {
      onToggle?.();
    }
    setQuery("");
    clearSearch();
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
    setActiveIndex(-1);
    if (value.trim()) {
      search(value);
    } else {
      clearSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    clearSearch();
    inputRef.current?.focus();
  };

  const visibleResults = results.slice(0, 12);
  const maxIndex = visibleResults.length - 1;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && visibleResults[activeIndex]) {
        handleChange(visibleResults[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setQuery("");
      clearSearch();
      inputRef.current?.blur();
    }
  };

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
            <div>
              <div className="relative">
                <input
                  ref={inputRef}
                  role="combobox"
                  aria-expanded={showOptions}
                  aria-controls="search-listbox-mobile"
                  aria-activedescendant={
                    activeIndex >= 0
                      ? `search-option-mobile-${activeIndex}`
                      : undefined
                  }
                  aria-autocomplete="list"
                  autoComplete="off"
                  className="w-full bg-input border border-outline rounded-full px-4 py-3 pl-12 pr-12 text-text-h1 placeholder-subtle focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200"
                  placeholder="Search Movies, TV Shows, People..."
                  value={query}
                  onChange={(e) => handleInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle hover:text-text-h1 transition-colors duration-200 p-1"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>

              {showOptions && (
                <div
                  role="listbox"
                  id="search-listbox-mobile"
                  className="absolute top-full left-0 right-0 mt-2 bg-action-primary border border-outline rounded-lg shadow-xl max-h-96 overflow-y-auto focus:outline-none"
                >
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

                      {visibleResults.length > 0 ? (
                        visibleResults.map((r: any, index: number) => (
                          <div
                            role="option"
                            key={`${r.media_type}-${r.id}`}
                            id={`search-option-mobile-${index}`}
                            aria-selected={activeIndex === index}
                            onClick={() => handleChange(r)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${
                              activeIndex === index
                                ? "bg-action-hover"
                                : "text-subtle"
                            }`}
                          >
                            <Poster
                              path={r.poster_path || r.profile_path}
                              alt={r.title || r.name}
                              useCustomSize
                              className="w-10 h-14 rounded flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-medium truncate ${
                                  activeIndex === index
                                    ? "text-accent-primary"
                                    : "text-subtle"
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
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-subtle">
                          No results for "{query}"
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Desktop: Regular search bar
  return (
    <div className="relative w-full" ref={searchRef}>
      <div>
        <div className="relative">
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={showOptions}
            aria-controls="search-listbox-desktop"
            aria-activedescendant={
              activeIndex >= 0
                ? `search-option-desktop-${activeIndex}`
                : undefined
            }
            aria-autocomplete="list"
            autoComplete="off"
            className="w-full bg-input border-2 border-outline rounded-full px-4 py-2.5 pl-10 pr-10 text-text-h1 placeholder-subtle focus:outline-none focus:border-accent-secondary focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200 text-sm md:text-base"
            placeholder="Search Movies, TV Shows, People..."
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-text-h1 transition-colors duration-200 p-1"
            >
              <FontAwesomeIcon icon={faTimes} className="text-sm" />
            </button>
          )}
        </div>

        {showOptions && (
          <div
            role="listbox"
            id="search-listbox-desktop"
            className="absolute top-full left-0 right-0 mt-1 bg-component-primary/95 backdrop-blur-lg border border-outline rounded-lg shadow-xl z-(--z-overlay) max-h-96 overflow-y-auto focus:outline-none text-sm"
          >
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

                {visibleResults.length > 0 ? (
                  visibleResults.map((r: any, index: number) => (
                    <div
                      role="option"
                      key={`${r.media_type}-${r.id}`}
                      id={`search-option-desktop-${index}`}
                      aria-selected={activeIndex === index}
                      onClick={() => handleChange(r)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-all duration-200 ${
                        activeIndex === index
                          ? "bg-action-hover"
                          : "text-subtle"
                      }`}
                    >
                      <Poster
                        path={r.poster_path || r.profile_path}
                        alt={r.title || r.name}
                        useCustomSize
                        className="w-8 h-12 rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            activeIndex === index
                              ? "text-accent-primary"
                              : "text-subtle"
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
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-subtle">
                    No results for "{query}"
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
