import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CreditsDetailHeader from "../../components/media/detail/CreditsDetailHeader";
import CreditsDetailGrid from "../../components/media/grid/CreditsDetailGrid";
import BackLink from "../../components/media/breadcrumbs/BackLink";
import SortingDropdown from "../../components/ui/SortingDropdown";
import { usePerson } from "../../hooks/people/usePerson";
import { useCombinedCredits } from "../../hooks/people/useCombinedCredits";
import { useMediaDetail } from "../../hooks/media/useMediaDetail";
import { useSortedMedia, type SortOption } from "../../hooks/sorting";
import { useClientChunkedData } from "../../hooks/infinite";
import InfiniteScrollWrapper from "../../components/ui/InfiniteScrollWrapper";
import type { MediaType } from "../../types/tmdb";

const CreditsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [sortOption, setSortOption] = useState<SortOption>("bayesian");

  const fromMediaType = searchParams.get("from") as MediaType | null;
  const mediaId = searchParams.get("mediaId");

  const personId = Number(id);
  if (!id || isNaN(personId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-400">Invalid person ID</p>
      </div>
    );
  }

  // Fetch person details
  const {
    data: person,
    isLoading: personLoading,
    error: personError,
  } = usePerson(personId);

  //use combinedcredits
  const {
    data: creditsData,
    isLoading: creditsLoading,
    error: creditsError,
  } = useCombinedCredits(personId);

  // Extract cast from the credits response

  // Fetch media details if we have context (optional)
  const { data: mediaDetails } = useMediaDetail(
    fromMediaType || undefined,
    mediaId ? Number(mediaId) : undefined
  );

  const enrichedCredits = creditsData?.cast || [];
  const sortedCredits = useSortedMedia(enrichedCredits, sortOption);

  const { visibleItems, hasMore, loadMore, reset } = useClientChunkedData(sortedCredits, 20);

  // Reset visible items when sort changes
  useEffect(() => {
    reset();
  }, [sortOption, reset]);

  // Loading states
  const isLoading = personLoading || creditsLoading;

  // Error states
  const hasError = personError || creditsError;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (hasError || !person) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-400">Error loading person</p>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <BackLink
        media_type={fromMediaType || undefined}
        id={mediaId || undefined}
        title={mediaDetails?.title || mediaDetails?.name || "Media"}
      />
      <CreditsDetailHeader
        id={person.id}
        name={person.name}
        biography={person.biography}
        known_for_department={person.known_for_department}
        place_of_birth={person.place_of_birth}
        profile_path={person.profile_path}
        birthday={person.birthday}
        gender={person.gender}
        deathday={person.deathday}
        />

<InfiniteScrollWrapper
          dataLength={visibleItems.length}
          hasMore={hasMore}
          next={loadMore}
        >
          <CreditsDetailGrid
            credits={visibleItems}
            totalCount={sortedCredits.length}
            loading={creditsLoading}
            error={creditsError ? "Failed to load credits" : null}
            headerRight={<SortingDropdown value={sortOption} onChange={setSortOption} />}
          />
        </InfiniteScrollWrapper>
    </div>
  );
};

export default CreditsDetailPage;
