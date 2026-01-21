import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";
import type { SortOption } from "../../hooks/sorting";

type Props = {
  value: SortOption;
  onChange: (option: SortOption) => void;
  className?: string;
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "bayesian", label: "Top Rated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "a-z", label: "A-Z" },
  { value: "z-a", label: "Z-A" },
];

export default function SortingDropdown({ value, onChange, className = "" }: Props) {
  const selectedOption = SORT_OPTIONS.find((opt) => opt.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={`relative w-36 ${className}`}>
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-800 border border-gray-600 py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all text-sm">
          <span className="block truncate">{selectedOption?.label || "Sort by"}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <FontAwesomeIcon
              icon={faChevronDown}
              className="h-4 w-4 text-gray-400"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-gray-800 border border-gray-600 py-1 text-sm shadow-lg focus:outline-none">
            {SORT_OPTIONS.map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? "bg-sky-500/20 text-white" : "text-gray-300"
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
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-400">
                        <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
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
  );
}
