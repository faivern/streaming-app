import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import CreditsDetailHeader from "../../components/media/detail/CreditsDetailHeader";
import CreditsDetailGrid from "../../components/media/grid/CreditsDetailGrid";
import SortingDropdown from "../../components/ui/SortingDropdown";
import { usePerson } from "../../hooks/people/usePerson";
import { useCombinedCredits } from "../../hooks/people/useCombinedCredits";
import { useSortedMedia, type SortOption } from "../../hooks/sorting";
import { useClientChunkedData } from "../../hooks/infinite";
import InfiniteScrollWrapper from "../../components/ui/InfiniteScrollWrapper";
import { personUrl } from "../../utils/urlBuilder";

const CreditsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sortOption, setSortOption] = useState<SortOption>("bayesian");

  const personId = parseInt(id || "", 10);
  if (!id || isNaN(personId)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mt-navbar-offset">
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

  const enrichedCredits = (creditsData?.cast || []) as any[];
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
      <div className="max-w-7xl mx-auto px-4 py-8 mt-navbar-offset">
        <p className="text-[var(--subtle)]">Loading...</p>
      </div>
    );
  }

  if (hasError || !person) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 mt-navbar-offset">
        <p className="text-red-400">Error loading person</p>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-navbar-offset">
      <Helmet>
        <title>{`${person?.name ?? "Person"} | Filmography | Cinelas`}</title>
        <meta name="description" content={`Explore the filmography of ${person?.name ?? "this person"}. See all movies and TV shows on Cinelas.`} />
        <link rel="canonical" href={`https://cinelas.com${personUrl(personId, person?.name ?? "")}`} />
        <meta property="og:title" content={`${person?.name ?? "Person"} | Filmography | Cinelas`} />
        <meta property="og:description" content={`Explore the filmography of ${person?.name ?? "this person"}.`} />
        <meta property="og:url" content={`https://cinelas.com${personUrl(personId, person?.name ?? "")}`} />
        <meta property="og:type" content="profile" />
        {person?.profile_path && <meta property="og:image" content={`https://image.tmdb.org/t/p/w500${person.profile_path}`} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:text-accent-primary cursor-pointer mb-6"
      >
        ← Back
      </button>
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
