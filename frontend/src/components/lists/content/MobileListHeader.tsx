import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import { Film, Tv } from "lucide-react";
import type { ListsSortOption } from "../../../types/lists.view";
import { LISTS_SORT_OPTIONS } from "../../../hooks/lists/useListsSorting";

type MobileListHeaderProps = {
  title: string;
  movieCount: number;
  tvCount: number;
  description?: string | null;
  sortOption: ListsSortOption;
  onSortChange: (option: ListsSortOption) => void;
};

export default function MobileListHeader({
  title,
  movieCount,
  tvCount,
  description,
  sortOption,
  onSortChange,
}: MobileListHeaderProps) {
  const selectedSortLabel =
    LISTS_SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || "Sort";

  return (
    <div className="mb-4">
      {/* Title */}
      <div className="mb-3">
        <div className="flex flex-row items-stretch">
          <span className="mr-3 bg-gradient-to-b from-accent-primary to-accent-secondary w-1 rounded" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-h1)] line-clamp-2">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-[var(--subtle)] mt-0.5 line-clamp-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Count + sort row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-[var(--subtle)]">
          <span className="flex items-center gap-1">
            <Film className="w-3.5 h-3.5 text-accent-primary" />
            {movieCount} {movieCount === 1 ? "movie" : "movies"}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Tv className="w-3.5 h-3.5 text-accent-primary" />
            {tvCount} {tvCount === 1 ? "show" : "shows"}
          </span>
        </div>

        {/* Compact sort dropdown */}
        <Listbox value={sortOption} onChange={onSortChange}>
          <div className="relative">
            <Listbox.Button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--action-primary)] border border-[var(--border)] text-xs text-[var(--subtle)]">
              <span className="truncate max-w-[80px]">{selectedSortLabel}</span>
              <FontAwesomeIcon
                icon={faChevronDown}
                className="h-2.5 w-2.5"
              />
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute right-0 z-[60] mt-1 w-40 overflow-auto rounded-lg bg-[var(--action-primary)] border border-[var(--border)] px-1 py-1 text-sm shadow-lg focus:outline-none">
                {LISTS_SORT_OPTIONS.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-pointer select-none rounded-md py-2.5 pl-7 pr-3 ${
                        active
                          ? "bg-accent-primary/20 text-[var(--text-h1)]"
                          : "text-[var(--subtle)]"
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected
                              ? "font-medium text-white"
                              : "font-normal"
                          }`}
                        >
                          {option.label}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-accent-primary">
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="h-3 w-3"
                            />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>
    </div>
  );
}
