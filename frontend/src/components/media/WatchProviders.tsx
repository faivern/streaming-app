import { useState, useEffect, Fragment, useMemo } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useWatchProviders, useWatchProviderRegions } from "../../hooks/media/useWatchProviders";
import type { MediaType, WatchProvider, WatchProviderRegion } from "../../types/tmdb";

type Props = {
  mediaType: MediaType;
  mediaId: number;
};

const STORAGE_KEY = "watchProviders_selectedCountry";

function getDefaultCountry(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;

  const browserLocale = navigator.language || "en-US";
  const countryCode = browserLocale.split("-")[1] || "US";
  return countryCode.toUpperCase();
}

function ProviderGroup({
  title,
  providers,
}: {
  title: string;
  providers?: WatchProvider[];
}) {
  if (!providers || providers.length === 0) return null;

  return (
    <div className="mb-5">
      <h4 className="text-sm text-gray-400 mb-3 font-medium">{title}</h4>
      <div className="flex flex-wrap gap-4">
        {providers.map((provider) => (
          <div
            key={provider.provider_id}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="relative">
              <img
                src={`https://image.tmdb.org/t/p/w154${provider.logo_path}`}
                alt={provider.provider_name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-gray-700 group-hover:border-sky-500 transition-all group-hover:scale-105 shadow-md"
              />
            </div>
            <span className="text-xs text-gray-400 group-hover:text-white transition-colors text-center">
              {provider.provider_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProvidersSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-24 mb-4" />
      <div className="flex flex-wrap gap-2 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-10 h-10 bg-gray-700 rounded-lg" />
        ))}
      </div>
      <div className="h-4 bg-gray-700 rounded w-20 mb-4" />
      <div className="flex flex-wrap gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-10 h-10 bg-gray-700 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function WatchProviders({ mediaType, mediaId }: Props) {
  const [selectedCountry, setSelectedCountry] = useState(getDefaultCountry);
  const [countrySearch, setCountrySearch] = useState("");

  const { data: providersData, isLoading: providersLoading } = useWatchProviders(
    mediaType,
    mediaId
  );
  const { data: regionsData, isLoading: regionsLoading } = useWatchProviderRegions();

  const regions = regionsData?.results ?? [];
  const countryProviders = providersData?.results?.[selectedCountry];

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedCountry);
  }, [selectedCountry]);

  const hasProviders =
    countryProviders &&
    (countryProviders.flatrate?.length ||
      countryProviders.rent?.length ||
      countryProviders.buy?.length ||
      countryProviders.ads?.length);

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-2xl font-bold text-text-h1">Where to Watch</h3>

        {regionsLoading ? (
          <div className="w-48 h-10 bg-gray-700 rounded-lg animate-pulse" />
        ) : (
          <Listbox value={selectedCountry} onChange={setSelectedCountry}>
            <div className="relative w-full sm:w-48">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-800 border border-gray-600 py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className={`fi fi-${selectedCountry.toLowerCase()}`}
                  ></span>
                  {selectedRegion?.english_name || selectedCountry}
                </span>
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
                <Listbox.Options className="absolute z-20 mt-1 max-h-72 w-full overflow-hidden rounded-lg bg-gray-800 border border-gray-600 text-sm shadow-lg focus:outline-none">
                  <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700">
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-3 w-3"
                      />
                      <input
                        type="text"
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-1.5 pl-8 pr-3 text-white placeholder-gray-400 focus:outline-none focus:border-sky-500 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-52 overflow-auto py-1">
                    {filteredRegions.length === 0 ? (
                      <div className="py-2 px-4 text-gray-400 text-center">No countries found</div>
                    ) : (
                      filteredRegions.map((region: WatchProviderRegion) => (
                        <Listbox.Option
                          key={region.iso_3166_1}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active ? "bg-sky-500/20 text-white" : "text-gray-300"
                            }`
                          }
                          value={region.iso_3166_1}
                        >
                          {({ selected }) => (
                            <>
                              <span className="flex items-center gap-2">
                                <span
                                  className={`fi fi-${region.iso_3166_1.toLowerCase()}`}
                                >
                                </span>
                                {region.english_name}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-400">
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
        )}
      </div>

      {providersLoading ? (
        <ProvidersSkeleton />
      ) : hasProviders ? (
        <>
          <ProviderGroup
            title="Stream"
            providers={countryProviders?.flatrate}
          />
          <ProviderGroup
            title="Rent"
            providers={countryProviders?.rent}
          />
          <ProviderGroup
            title="Buy"
            providers={countryProviders?.buy}
          />
          <ProviderGroup
            title="Free with Ads"
            providers={countryProviders?.ads}
          />

          {countryProviders?.link && (
            <a
              href={countryProviders.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-sky-400 transition-colors mt-2"
            >
              <span>View on JustWatch</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </>
      ) : (
        <p className="text-gray-400 text-sm">
          No streaming information available for{" "}
          {selectedRegion?.english_name || selectedCountry}.
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Streaming data provided by{" "}
        <a
          href="https://www.justwatch.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-500 hover:underline"
        >
          JustWatch
        </a>
      </p>
    </div>
  );
}
