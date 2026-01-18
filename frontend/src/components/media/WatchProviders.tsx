import { useState, useEffect, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCheck } from "@fortawesome/free-solid-svg-icons";
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
    <div className="mb-4">
      <h4 className="text-sm text-gray-400 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {providers.map((provider) => (
          <div
            key={provider.provider_id}
            className="group relative"
            title={provider.provider_name}
          >
            <img
              src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
              alt={provider.provider_name}
              className="w-10 h-10 rounded-lg object-cover border border-gray-700 hover:border-sky-500 transition-colors"
            />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
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

  const { data: providersData, isLoading: providersLoading } = useWatchProviders(
    mediaType,
    mediaId
  );
  const { data: regionsData, isLoading: regionsLoading } = useWatchProviderRegions();

  const regions = regionsData?.results ?? [];
  const countryProviders = providersData?.results?.[selectedCountry];

  const selectedRegion = regions.find((r) => r.iso_3166_1 === selectedCountry);

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
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-white">Where to Watch</h3>

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
                <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-gray-800 border border-gray-600 py-1 text-sm shadow-lg focus:outline-none">
                  {regions.map((region: WatchProviderRegion) => (
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
                              {/*region.iso_3166_1.toLowerCase()*/}
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
                  ))}
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
          <ProviderGroup title="Rent" providers={countryProviders?.rent} />
          <ProviderGroup title="Buy" providers={countryProviders?.buy} />
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
