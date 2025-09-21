import { useParams, useSearchParams } from "react-router-dom";
import CreditsDetailHeader from "../../components/media/detail/CreditsDetailHeader";
import CreditsDetailGrid from "../../components/media/grid/CreditsDetailGrid";
import BackLink from "../../components/media/breadcrumbs/BackLink";
import Loading from "../../components/feedback/Loading";
import Error from "../../components/feedback/Error";

import { usePerson } from "../../hooks/people/usePerson";
import { useCombinedCredits } from "../../hooks/people/useCombinedCredits";
import { useMediaDetail } from "../../hooks/media/useMediaDetail";
import type { MediaType } from "../../types/tmdb";

const CreditsDetailPage = () => {
  const { id, name } = useParams<{ id: string; name: string }>();
  const [searchParams] = useSearchParams();

  // Debug logging
  console.log("=== CreditsDetailPage Debug ===");
  console.log("URL:", window.location.href);
  console.log("Route params:", { id, name });
  console.log("Search params:", Object.fromEntries(searchParams.entries()));
  console.log("Person ID:", Number(id));

  const fromMediaType = searchParams.get("from") as MediaType | null;
  const mediaId = searchParams.get("mediaId");

  console.log("Extracted:", { fromMediaType, mediaId });

  const personId = Number(id);

  // Add early return with debug info
  if (!id || isNaN(personId)) {
    console.log("Invalid person ID:", { id, personId });
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-600 text-white p-4 rounded">
          <p>Debug: Invalid person ID</p>
          <p>ID from URL: {id}</p>
          <p>Parsed ID: {personId}</p>
        </div>
      </div>
    );
  }

  // Fetch person details
  const {
    data: person,
    isLoading: personLoading,
    error: personError,
  } = usePerson(personId);

  console.log("Person data:", { person, personLoading, personError });


  //use combinedcredits
  const {
    data: creditsData,
    isLoading: creditsLoading,
    error: creditsError,
  } = useCombinedCredits(personId);

  // Extract cast from the credits response
  
  // Fetch media details if we have context (optional)
  const {
    data: mediaDetails,
    isLoading: mediaLoading,
    error: mediaError,
  } = useMediaDetail(
    fromMediaType || undefined,
    mediaId ? Number(mediaId) : undefined
  );
  
  const enrichedCredits = creditsData?.cast || [];

  // Loading states
  const isLoading = personLoading || creditsLoading;

  // Error states
  const hasError = personError || creditsError;

  // Add debug render for loading
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-blue-600 text-white p-4 rounded">
          <p>Loading person {personId}...</p>
        </div>
      </div>
    );
  }

  // Add debug render for error
  if (hasError || !person) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-600 text-white p-4 rounded">
          <p>Error loading person {personId}</p>
          <p>Person error: {personError?.message}</p>
          <p>Credits error: {creditsError?.message}</p>
        </div>
      </div>
    );
  }

  // Add debug to your main render
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-green-600 text-white p-4 rounded mb-4">
        <p>Successfully loaded person: {person.name}</p>
      </div>

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

      <div className="mt-4">
        <CreditsDetailGrid
          credits={enrichedCredits}
          loading={creditsLoading}
          error={creditsError ? "Failed to load credits" : null}
        />
      </div>
    </div>
  );
};

export default CreditsDetailPage;
