// components/SearchBar.tsx
import { useState, useRef, useEffect, Fragment } from "react";
import { useSearch } from "../../hooks/useSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Combobox, Transition } from "@headlessui/react";
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
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  // Auto-focus when expanded on mobile
  useEffect(() => {
    if (isMobile && isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile, isExpanded]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (isMobile && isExpanded) {
          onToggle?.();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isExpanded, onToggle]);

  const handleChange = (val: any) => {
    setSelected(val);
    setOpen(false);
    if (isMobile) {
      onToggle?.();
    }
    // Navigate after selection
    window.location.href =
      val.media_type === "person"
        ? `/person/${val.id}/${(val.name || "unknown")
            .toLowerCase()
            .split(" ")
            .join("-")}`
        : `/media/${val.media_type}/${val.id}`;
  };

  const handleInput = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      search(value);
      setOpen(true);
    } else {
      clearSearch();
      setOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    clearSearch();
    setSelected(null);
    setOpen(false);
    if (isMobile) {
      onToggle?.();
    }
  };

  // Mobile: Just return search icon when collapsed
  if (isMobile && !isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="p-2 text-white hover:text-blue-300 transition"
        aria-label="Open search"
      >
        <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
      </button>
    );
  }

  // Mobile: Full screen overlay when expanded
  if (isMobile && isExpanded) {
    return (
      <div className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-lg">
        <div className="flex items-center p-4 border-b border-gray-700">
          <Combobox value={selected} onChange={handleChange} nullable>
            <div className="flex-1 relative" ref={searchRef}>
              <div className="relative">
                <Combobox.Input
                  ref={inputRef}
                  className="w-full bg-gray-800 border border-gray-600 rounded-full px-4 py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-200"
                  placeholder="Search titles, people..."
                  displayValue={() => query}
                  onChange={(e) => handleInput(e.target.value)}
                  onFocus={() => query && setOpen(true)}
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>

              <Transition
                as={Fragment}
                show={open && (query.trim().length > 0 || hasSearched)}
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 -translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 -translate-y-1"
              >
                <Combobox.Options className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-96 overflow-y-auto focus:outline-none">
                  {loading && (
                    <div className="p-4 text-center text-gray-400">
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
                        <div className="p-3 text-xs text-gray-400 border-b border-gray-700">
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
                                  ? "bg-sky-500/20 text-white"
                                  : "text-gray-200 hover:bg-gray-700/50"
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
                                      active ? "text-sky-300" : "text-white"
                                    }`}
                                  >
                                    {r.title || r.name}
                                  </p>
                                  <p className="text-sm text-gray-400 capitalize truncate">
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
                        <div className="p-4 text-center text-gray-400">
                          No results for "{query}"
                        </div>
                      )}
                    </>
                  )}
                </Combobox.Options>
              </Transition>
            </div>
          </Combobox>

          <button
            onClick={onToggle}
            className="ml-4 p-2 text-gray-400 hover:text-white transition"
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
    <Combobox value={selected} onChange={handleChange} nullable>
      <div className="relative w-full" ref={searchRef}>
        <div className="relative">
          <Combobox.Input
            ref={inputRef}
            className="w-full bg-gray-900/40 border border-gray-600 rounded-full px-4 py-2.5 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-accent-secondary focus:border-2 focus:ring-2 focus:ring-accent-primary/20 transition-all duration-200 text-sm md:text-base"
            placeholder="Search Movies, TV Shows, People..."
            displayValue={() => query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => query && setOpen(true)}
            />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1"
            >
              <FontAwesomeIcon icon={faTimes} className="text-sm" />
            </button>
          )}
        </div>

        <Transition
          as={Fragment}
          show={open && (query.trim().length > 0 || hasSearched)}
          enter="transition ease-out duration-100"
          enterFrom="opacity-0 -translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-75"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-1"
        >
          <Combobox.Options className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-lg border border-gray-600 rounded-lg shadow-xl z-[60] max-h-96 overflow-y-auto focus:outline-none text-sm">
            {loading && (
              <div className="p-4 text-center text-gray-400">
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
                  <div className="p-2 text-xs text-gray-400 border-b border-gray-700">
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
                            ? "bg-sky-500/20 text-white"
                            : "text-gray-200 hover:bg-gray-800/50"
                        }`
                      }
                    >
                      {({ active }) => (
                        <>
                          <Poster
                            path={r.poster_path || r.profile_path }
                            alt={r.title || r.name}
                            useCustomSize
                            className="w-8 h-12 rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium truncate ${
                                active ? "text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary" : "text-white"
                              }`}
                            >
                              {r.title || r.name}
                            </p>
                            <p className="text-xs text-gray-400 capitalize truncate">
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
                  <div className="p-4 text-center text-gray-400">
                    No results for "{query}"
                  </div>
                )}
              </>
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
