import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MediaCastCard from "../../components/media/cards/MediaCastCard";
import TitleMid from "../../components/media/title/TitleMid";
import type { MediaType, CreditsResponse } from "../../types/tmdb";
import { useMediaCredits } from "../../hooks/people/useMediaCredits";
import { useMediaDetail } from "../../hooks/media/useMediaDetail";

//TODO Separate the filter segments into their own component

type RouteParams = {
  mediaType: MediaType;
  id: string;
};

const CreditsPage = () => {
  const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast");

  // read and normalize route params
  const { mediaType = "movie", id: idParam } = useParams<RouteParams>();
  const id = Number(idParam);
  // guard invalid id early
  const isValidId = Number.isFinite(id) && id > 0;

  const {
    data: credits,
    isLoading: creditsLoading,
    isError: creditsError,
  } = useMediaCredits(mediaType, isValidId ? id : undefined);

  const {
    data: details,
    isLoading: detailsLoading,
    isError: detailsError,
  } = useMediaDetail(mediaType, isValidId ? id : undefined);

  const cast = credits?.cast ?? [];
  const crew = credits?.crew ?? [];

  const mediaTitle =
    details?.title ?? details?.name ?? "Unknown title";

  type CrewMember = CreditsResponse["crew"][number];

  const organizedCrew = useMemo(() => {
    return crew.reduce((acc, member) => {
      const key = member.department || "Other";
      (acc[key] ??= []).push(member);
      return acc;
    }, {} as Record<string, CrewMember[]>);
  }, [crew]);

  // loading & error states
  if (!isValidId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white grid place-items-center">
        <p className="text-gray-300">Invalid media id.</p>
      </div>
    );
  }

  if (creditsLoading || detailsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white grid place-items-center">
        <p className="text-gray-300">Loading full cast & crew…</p>
      </div>
    );
  }

  if (creditsError || detailsError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white grid place-items-center">
        <p className="text-red-300">Failed to load credits.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/media/${mediaType}/${id}`}
            className="text-blue-400 hover:text-blue-300 mb-4 inline-block"
          >
            ← Back to {mediaTitle}
          </Link>
          <h1 className="text-4xl font-bold mb-2">{mediaTitle}</h1>
          <p className="text-gray-400 text-lg">Full Cast &amp; Crew</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-8">
          <button
            onClick={() => setActiveTab("cast")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "cast"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Cast ({cast.length})
          </button>
          <button
            onClick={() => setActiveTab("crew")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "crew"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Crew ({crew.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "cast" && (
          <>
                <TitleMid>Actors</TitleMid>
            {cast.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-2">
                {cast
                  .slice() // don’t mutate original
                  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
                  .map((person) => (
                    <MediaCastCard key={person.id} cast={person} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No cast information available.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "crew" && (
          <>
            {crew.length > 0 ? (
              <div className="space-y-8">
                {Object.entries(organizedCrew)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([department, members]) => (
                    <div key={department}>
                      <TitleMid>{department}</TitleMid>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-2">
                        {members.map((person) => (
                          <MediaCastCard
                            key={`${person.id}-${person.job}`}
                            cast={person}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  No crew information available.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreditsPage;
