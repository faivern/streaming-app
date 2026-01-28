import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import ViewToggle from "./ViewToggle";
import type { ViewMode, ListsSortOption } from "../../../types/lists.view";
import { LISTS_SORT_OPTIONS } from "../../../hooks/lists/useListsSorting";

type ListHeaderProps = {
  title: string;
  itemCount: number;
  description?: string | null;
  viewMode: ViewMode;
  sortOption: ListsSortOption;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (option: ListsSortOption) => void;
  onAddMedia?: () => void;
  showAddButton?: boolean;
};

export default function ListHeader({
  title,
  itemCount,
  description,
  viewMode,
  sortOption,
  onViewModeChange,
  onSortChange,
  onAddMedia,
  showAddButton = true,
}: ListHeaderProps) {
  const selectedSortLabel =
    LISTS_SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || "Sort";

  return (
    <div className="mb-6">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {description && (
            <p className="text-gray-400 text-sm mt-1">{description}</p>
          )}
        </div>

        {showAddButton && onAddMedia && (
          <button
            onClick={onAddMedia}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary/80 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            Add Media
          </button>
        )}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-4 mt-4">
        <span className="text-sm text-gray-400">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>

        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <Listbox value={sortOption} onChange={onSortChange}>
            <div className="relative w-36">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-800 border border-gray-700 py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm">
                <span className="block truncate">{selectedSortLabel}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="h-3 w-3 text-gray-400"
                  />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-gray-800 border border-gray-700 py-1 text-sm shadow-lg focus:outline-none">
                  {LISTS_SORT_OPTIONS.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                          active
                            ? "bg-accent-primary/20 text-white"
                            : "text-gray-300"
                        }`
                      }
                      value={option.value}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium text-white" : "font-normal"
                            }`}
                          >
                            {option.label}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent-primary">
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

          {/* View toggle */}
          <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
        </div>
      </div>
    </div>
  );
}
