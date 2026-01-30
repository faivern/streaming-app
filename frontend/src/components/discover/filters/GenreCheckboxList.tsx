import { Fragment, useMemo } from "react";
import { Popover, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useGenres } from "../../../hooks/genres/useGenres";
import type { DiscoverMediaType } from "../../../hooks/discover/useDiscoverFilters";

type Props = {
  mediaType: DiscoverMediaType;
  selectedGenreIds: number[];
  onToggleGenre: (genreId: number) => void;
};

export default function GenreCheckboxList({
  mediaType,
  selectedGenreIds,
  onToggleGenre,
}: Props) {
  const { data: genres = [], isLoading } = useGenres();

  const filteredGenres = useMemo(() => {
    // For "both", show all genres; otherwise filter by media type
    if (mediaType === "both") {
      return genres.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
    return genres
      .filter((genre) => genre.supportedMediaTypes.includes(mediaType))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [genres, mediaType]);

  // Get selected genre names for display
  const selectedGenreNames = useMemo(() => {
    return filteredGenres
      .filter((g) => selectedGenreIds.includes(g.id))
      .map((g) => g.name);
  }, [filteredGenres, selectedGenreIds]);

  const buttonLabel = useMemo(() => {
    if (selectedGenreNames.length === 0) return "All Genres";
    if (selectedGenreNames.length === 1) return selectedGenreNames[0];
    if (selectedGenreNames.length === 2) return selectedGenreNames.join(", ");
    return `${selectedGenreNames.length} genres selected`;
  }, [selectedGenreNames]);

  if (isLoading) {
    return (
      <div className="h-10 bg-gray-700/50 rounded-lg animate-pulse" />
    );
  }

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button className="relative w-full cursor-pointer rounded-lg bg-gray-700/50 border border-gray-600 py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm">
            <span className="block truncate">{buttonLabel}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`h-3 w-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </span>
          </Popover.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-lg bg-gray-800 border border-gray-600 py-2 shadow-lg focus:outline-none">
              {filteredGenres.map((genre) => {
                const isSelected = selectedGenreIds.includes(genre.id);
                return (
                  <label
                    key={genre.id}
                    className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-accent-primary/20 text-white"
                        : "text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleGenre(genre.id)}
                      className="w-4 h-4 rounded border-gray-500 bg-gray-700 text-accent-primary focus:ring-accent-primary/50 focus:ring-offset-0"
                    />
                    <span className="text-sm">{genre.name}</span>
                  </label>
                );
              })}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
