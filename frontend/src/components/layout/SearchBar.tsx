// components/SearchBar.tsx
import { useState, useRef, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { useSearch } from "../../hooks/useSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Combobox, Transition } from "@headlessui/react";
import Poster from "../media/shared/Poster";

export default function SearchBar() {
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (val: any) => {
    setSelected(val);
    setOpen(false);
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
    inputRef.current?.focus();
  };

  return (
    <Combobox value={selected} onChange={handleChange} nullable>
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Combobox.Input
            ref={inputRef}
            className="w-80 md:w-96 lg:w-[32rem] bg-gray-900/40 border border-gray-600 rounded-full px-4 py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-sky-500"
            placeholder="Titles, people..."
            displayValue={() => query}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => query && setOpen(true)}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
          <Combobox.Options className="absolute top-full left-0 right-0 mt-1 bg-gray-900 backdrop-blur-lg border border-gray-600 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto focus:outline-none text-sm">
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
                        `flex items-center gap-3 px-4 py-2 cursor-pointer ${
                          active ? "bg-sky-500/20 text-white" : "text-gray-200"
                        }`
                      }
                    >
                      {({ active }) => (
                        <>
                          <Poster
                            path={r.poster_path || r.profile_path}
                            alt={r.title || r.name}
                            useCustomSize
                            className="w-8 h-12 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium truncate ${
                                active ? "text-sky-300" : "text-white"
                              }`}
                            >
                              {r.title || r.name}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
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
