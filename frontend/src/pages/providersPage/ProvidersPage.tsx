import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import BackLink from "../../components/media/breadcrumbs/BackLink";
import WatchProviderCard from "../../components/media/cards/WatchProviderCard";
import RegionSelector, {
  getDefaultCountry,
  REGION_STORAGE_KEY,
} from "../../components/media/RegionSelector";

import Loading from "../../components/feedback/Loading";
import Error from "../../components/feedback/Error";

import TitleMid from "../../components/media/title/TitleMid";

import { useWatchProvidersList } from "../../hooks/media/useWatchProvidersList";
import { useWatchProviderRegions } from "../../hooks/media/useWatchProviders";

export default function ProvidersPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlRegion = searchParams.get("region");
  const [selectedRegion, setSelectedRegion] = useState<string>(
    urlRegion || getDefaultCountry()
  );

  // Fetch regions and providers
  const { data: regionsData, isLoading: regionsLoading } =
    useWatchProviderRegions();
  const {
    data: providers = [],
    isLoading: providersLoading,
    isError,
  } = useWatchProvidersList(selectedRegion);

  const regions = regionsData?.results ?? [];

  // Sync URL with region changes
  useEffect(() => {
    const newParams = new URLSearchParams();
    newParams.set("region", selectedRegion);
    navigate(`/providers?${newParams.toString()}`, { replace: true });
  }, [selectedRegion, navigate]);

  // Persist region to localStorage
  useEffect(() => {
    localStorage.setItem(REGION_STORAGE_KEY, selectedRegion);
  }, [selectedRegion]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
  };

  const selectedRegionName =
    regions.find((r) => r.iso_3166_1 === selectedRegion)?.english_name ||
    selectedRegion;

  if (providersLoading || regionsLoading) {
    return <Loading message="Loading streaming services..." />;
  }

  if (isError) {
    return <Error message="Error loading streaming services" />;
  }

  return (
    <main className="mt-20 md:mt-24 lg:mt-28 xl:mt-32 max-w-7xl mx-auto px-4 py-8">
      <BackLink />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <TitleMid className="text-3xl">Streaming Services</TitleMid>
          <p className="text-lg text-gray-300 italic">
            {providers.length} services available in {selectedRegionName}
          </p>
        </div>

        <RegionSelector
          regions={regions}
          selectedCountry={selectedRegion}
          onCountryChange={handleRegionChange}
          loading={regionsLoading}
        />
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No streaming services available in this region.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Try selecting a different region.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          {providers.map((provider) => (
            <WatchProviderCard
              key={provider.provider_id}
              providerId={provider.provider_id}
              providerName={provider.provider_name}
              logoPath={provider.logo_path}
              region={selectedRegion}
            />
          ))}
        </div>
      )}
    </main>
  );
}
