import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";

type RuntimeRange = { min?: number; max?: number };

type Props = {
  value: RuntimeRange;
  onChange: (range: RuntimeRange) => void;
};

const RUNTIME_OPTIONS: { label: string; range: RuntimeRange }[] = [
  { label: "Any Length", range: {} },
  { label: "Under 90 min", range: { max: 90 } },
  { label: "90-120 min", range: { min: 90, max: 120 } },
  { label: "120-150 min", range: { min: 120, max: 150 } },
  { label: "Over 150 min", range: { min: 150 } },
];

function rangesMatch(a: RuntimeRange, b: RuntimeRange): boolean {
  return a.min === b.min && a.max === b.max;
}

export default function RuntimeSelector({ value, onChange }: Props) {
  const selectedOption =
    RUNTIME_OPTIONS.find((opt) => rangesMatch(opt.range, value)) ||
    RUNTIME_OPTIONS[0];

  return (
    <Listbox
      value={selectedOption}
      onChange={(opt) => onChange(opt.range)}
    >
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-700/50 border border-gray-600 py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm">
          <span className="block truncate">{selectedOption.label}</span>
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
          <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-gray-800 border border-gray-600 py-1 text-sm shadow-lg focus:outline-none">
            {RUNTIME_OPTIONS.map((option) => (
              <Listbox.Option
                key={option.label}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                    active ? "bg-accent-primary/20 text-white" : "text-gray-300"
                  }`
                }
                value={option}
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
