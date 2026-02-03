import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import BackLink from "../../components/media/breadcrumbs/BackLink";
import MediaTypeToggle from "../../components/media/grid/MediaTypeToggle";
import GenreDetailGrid from "../../components/media/grid/GenreDetailGrid";
import RegionSelector, {
  getDefaultCountry,
  REGION_STORAGE_KEY,
} from "../../components/media/RegionSelector";

import Loading from "../../components/feedback/Loading";
import Error from "../../components/feedback/Error";

import TitleMid from "../../components/media/title/TitleMid";

import { useInfiniteDiscoverByProvider } from "../../hooks/discover/useInfiniteDiscoverByProvider";
import { useWatchProviderRegions } from "../../hooks/media/useWatchProviders";
import InfiniteScrollWrapper from "../../components/ui/InfiniteScrollWrapper";
import type { MediaType } from "../../types/tmdb";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w154";

export default function ProviderPage() {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const providerName = searchParams.get("name") || "Unknown Provider";
  const urlRegion = searchParams.get("region");
  const urlMediaType = searchParams.get("mediaType") as MediaType | null;

  // Parse provider ID
  const providerIdNum = useMemo(() => {
    const n = Number(providerId);
    return Number.isFinite(n) ? n : undefined;
  }, [providerId]);

  // State
  const [mediaType, setMediaType] = useState<MediaType>(urlMediaType || "movie");
  const [selectedRegion, setSelectedRegion] = useState<string>(
    urlRegion || getDefaultCountry()
  );

  // Fetch regions for selector
  const { data: regionsData, isLoading: regionsLoading } =
    useWatchProviderRegions();
  const regions = regionsData?.results ?? [];

  // Sync URL with state changes
  useEffect(() => {
    if (!providerIdNum) return;

    const newParams = new URLSearchParams(searchParams);
    newParams.set("name", providerName);
    newParams.set("region", selectedRegion);
    newParams.set("mediaType", mediaType);

    const newUrl = `/provider/${providerIdNum}?${newParams.toString()}`;
    navigate(newUrl, { replace: true });
  }, [selectedRegion, mediaType, providerIdNum, providerName, navigate, searchParams]);

  // Persist region to localStorage
  useEffect(() => {
    localStorage.setItem(REGION_STORAGE_KEY, selectedRegion);
  }, [selectedRegion]);

  const handleToggle = (type: MediaType) => {
    setMediaType(type);
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  // Fetch media for this provider
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteDiscoverByProvider({
    providerId: providerIdNum,
    mediaType,
    watchRegion: selectedRegion,
  });

  const items = data?.pages.flatMap((p) => p.results) ?? [];

  if (!providerIdNum) {
    return <Error message="Invalid or missing provider id." />;
  }

  if (isLoading) {
    return <Loading message={`Loading ${providerName}...`} />;
  }

  if (isError) {
    return <Error message={`Error loading ${providerName}`} />;
  }

  // Try to get logo from first result's backdrop or use placeholder
  const providerLogo = searchParams.get("logo");

  return (
    <main className="mt-20 md:mt-24 lg:mt-28 xl:mt-32 max-w-7xl mx-auto px-4 py-8">
      <BackLink />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        {providerLogo && (
          <img
            src={`${TMDB_IMAGE_BASE}${providerLogo}`}
            alt={providerName}
            className="w-16 h-16 rounded-xl object-cover"
          />
        )}
        <div className="flex-1">
          <TitleMid className="text-3xl">{providerName}</TitleMid>
          <p className="text-lg text-gray-300 italic">
            Browse {mediaType === "tv" ? "shows" : "movies"} available on{" "}
            {providerName}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <MediaTypeToggle selectedType={mediaType} onToggle={handleToggle} />

        <RegionSelector
          regions={regions}
          selectedCountry={selectedRegion}
          onCountryChange={handleRegionChange}
          loading={regionsLoading}
        />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No {mediaType === "tv" ? "shows" : "movies"} available on{" "}
            {providerName} in this region.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Try selecting a different region or media type.
          </p>
        </div>
      ) : (
        <InfiniteScrollWrapper
          dataLength={items.length}
          hasMore={hasNextPage ?? false}
          next={fetchNextPage}
          loader={
            isFetchingNextPage ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            ) : undefined
          }
        >
          <GenreDetailGrid genreMedia={items} mediaType={mediaType} />
        </InfiniteScrollWrapper>
      )}
    </main>
  );
}
