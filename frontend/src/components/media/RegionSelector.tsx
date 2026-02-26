import { Fragment, useMemo, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCheck,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import type { WatchProviderRegion } from "../../types/tmdb";

type Props = {
  regions: WatchProviderRegion[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  loading?: boolean;
  className?: string;
};

export default function RegionSelector({
  regions,
  selectedCountry,
  onCountryChange,
  loading = false,
  className = "",
}: Props) {
  const [countrySearch, setCountrySearch] = useState("");

  const selectedRegion = regions.find((r) => r.iso_3166_1 === selectedCountry);

  const filteredRegions = useMemo(() => {
    if (!countrySearch.trim()) return regions;
    const search = countrySearch.toLowerCase();
    return regions.filter(
      (r) =>
        r.english_name.toLowerCase().includes(search) ||
        r.iso_3166_1.toLowerCase().includes(search)
    );
  }, [regions, countrySearch]);

  if (loading) {
    return (
      <div
        className={`w-48 h-10 bg-action-primary rounded-lg animate-pulse ${className}`}
      />
    );
  }

  return (
    <Listbox value={selectedCountry} onChange={onCountryChange}>
      <div className={`relative w-full sm:w-48 ${className}`}>
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-component-primary border border-outline py-2 pl-3 pr-10 text-left text-text-h1 focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all text-sm">
          <span className="flex items-center gap-2">
            <span className={`fi fi-${selectedCountry.toLowerCase()}`}></span>
            {selectedRegion?.english_name || selectedCountry}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <FontAwesomeIcon
              icon={faChevronDown}
              className="h-4 w-4 text-subtle"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-(--z-dropdown) mt-1 max-h-72 w-full overflow-hidden rounded-lg bg-component-primary border border-outline text-sm shadow-lg focus:outline-none">
            <div className="sticky top-0 bg-component-primary p-2 border-b border-outline">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle h-3 w-3"
                />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="w-full bg-input border border-outline rounded-md py-1.5 pl-8 pr-3 text-text-h1 placeholder:text-subtle focus:outline-none focus:border-accent-primary text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-52 overflow-auto py-1">
              {filteredRegions.length === 0 ? (
                <div className="py-2 px-4 text-subtle text-center">
                  No countries found
                </div>
              ) : (
                filteredRegions.map((region: WatchProviderRegion) => (
                  <Listbox.Option
                    key={region.iso_3166_1}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                        active ? "bg-action-hover text-text-h1" : "text-subtle"
                      }`
                    }
                    value={region.iso_3166_1}
                  >
                    {({ selected }) => (
                      <>
                        <span className="flex items-center gap-2">
                          <span
                            className={`fi fi-${region.iso_3166_1.toLowerCase()}`}
                          ></span>
                          {region.english_name}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent-primary">
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="h-4 w-4"
                            />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))
              )}
            </div>
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}

// Helper to get default country from localStorage or browser locale
export const REGION_STORAGE_KEY = "watchProviders_selectedCountry";

export function getDefaultCountry(): string {
  const stored = localStorage.getItem(REGION_STORAGE_KEY);
  if (stored) return stored;

  const browserLocale = navigator.language || "en-US";
  const countryCode = browserLocale.split("-")[1] || "US";
  return countryCode.toUpperCase();
}
