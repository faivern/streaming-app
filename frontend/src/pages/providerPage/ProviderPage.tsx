import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Film, Tv } from "lucide-react";

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
import { useWatchProvidersList } from "../../hooks/media/useWatchProvidersList";
import { getAdvancedDiscover } from "../../api/advancedDiscover.api";
import InfiniteScrollWrapper from "../../components/ui/InfiniteScrollWrapper";
import SortByDropdown from "../../components/discover/filters/SortByDropdown";
import type { MediaType } from "../../types/tmdb";
import { providerUrl as buildProviderUrl } from "../../utils/urlBuilder";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export default function ProviderPage() {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlRegion = searchParams.get("region");
  const urlMediaType = searchParams.get("mediaType") as MediaType | null;

  // Parse provider ID
  const providerIdNum = useMemo(() => {
    const n = parseInt(providerId || "", 10);
    return Number.isFinite(n) ? n : undefined;
  }, [providerId]);

  // State
  const [mediaType, setMediaType] = useState<MediaType>(urlMediaType || "movie");
  const [selectedRegion, setSelectedRegion] = useState<string>(
    urlRegion || getDefaultCountry()
  );
  const [sortBy, setSortBy] = useState<string>("popularity.desc");

  // Fetch regions for selector
  const { data: regionsData, isLoading: regionsLoading } =
    useWatchProviderRegions();
  const regions = regionsData?.results ?? [];

  // Fetch provider list to get name and logo by ID
  const { data: providersList } = useWatchProvidersList(selectedRegion);
  const providerInfo = providersList?.find((p) => p.provider_id === providerIdNum);
  const providerName = providerInfo?.provider_name ?? "Unknown Provider";
  const providerLogo = providerInfo?.logo_path ?? null;

  // Sync URL with state changes
  useEffect(() => {
    if (!providerIdNum) return;

    const newParams = new URLSearchParams();
    newParams.set("region", selectedRegion);
    newParams.set("mediaType", mediaType);

    const newUrl = `${buildProviderUrl(providerIdNum, providerName)}?${newParams.toString()}`;
    navigate(newUrl, { replace: true });
  }, [selectedRegion, mediaType, providerIdNum, providerName, navigate]);

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
    sortBy,
  });

  const items = data?.pages.flatMap((p) => p.results) ?? [];

  // Fetch counts for both media types (just first page to get total_results)
  const { data: movieCountData } = useQuery({
    queryKey: ["provider", "count", "movie", providerIdNum, selectedRegion],
    queryFn: () =>
      getAdvancedDiscover({
        mediaType: "movie",
        withWatchProviders: providerIdNum!,
        watchRegion: selectedRegion,
        page: 1,
        sortBy: "popularity.desc",
      }),
    enabled: Boolean(providerIdNum),
    staleTime: 5 * 60 * 1000,
  });

  const { data: tvCountData } = useQuery({
    queryKey: ["provider", "count", "tv", providerIdNum, selectedRegion],
    queryFn: () =>
      getAdvancedDiscover({
        mediaType: "tv",
        withWatchProviders: providerIdNum!,
        watchRegion: selectedRegion,
        page: 1,
        sortBy: "popularity.desc",
      }),
    enabled: Boolean(providerIdNum),
    staleTime: 5 * 60 * 1000,
  });

  const movieCount = movieCountData?.total_results ?? 0;
  const tvCount = tvCountData?.total_results ?? 0;
  const totalMediaCount = movieCount + tvCount;

  if (!providerIdNum) {
    return <Error message="Invalid or missing provider id." />;
  }

  if (isLoading) {
    return <Loading message={`Loading ${providerName}...`} />;
  }

  if (isError) {
    return <Error message={`Error loading ${providerName}`} />;
  }

  return (
    <main className="mt-navbar-offset max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>{`${providerName} — Streaming Catalog | Cinelas`}</title>
        <meta name="description" content={`Browse movies and TV shows available on ${providerName}. Find what to watch on Cinelas.`} />
        <link rel="canonical" href={`https://cinelas.com${buildProviderUrl(providerIdNum!, providerName)}`} />
        <meta property="og:title" content={`${providerName} — Streaming Catalog | Cinelas`} />
        <meta property="og:description" content={`Browse movies and TV shows available on ${providerName}.`} />
        <meta property="og:url" content={`https://cinelas.com${buildProviderUrl(providerIdNum!, providerName)}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

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

      <div className="flex items-center gap-3 text-sm text-gray-400 isolation-auto mb-4">
        {/* count display */}
        <span
          className="flex items-center gap-1 isolate"
          style={{ contain: "paint", willChange: "transform" }}
        >
          <Film className="w-4 h-4 text-accent-primary" />
          {movieCount} {movieCount === 1 ? "Movie" : "Movies"}
        </span>

        <span
          className="flex items-center gap-1 isolate"
          style={{ contain: "paint", willChange: "transform" }}
        >
          <Tv className="w-4 h-4 text-accent-primary" />
          {tvCount} {tvCount === 1 ? "TV Show" : "TV Shows"}
        </span>

        <span>•</span>
        <span>{totalMediaCount} Total</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-2">
        <MediaTypeToggle selectedType={mediaType} onToggle={handleToggle} compact />

        <div className="flex items-center gap-3">
          <SortByDropdown value={sortBy} onChange={setSortBy} />
          <RegionSelector
            regions={regions}
            selectedCountry={selectedRegion}
            onCountryChange={handleRegionChange}
            loading={regionsLoading}
          />
        </div>
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
