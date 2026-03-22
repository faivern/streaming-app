import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MediaCastCard from "../../components/media/cards/MediaCastCard";
import TitleMid from "../../components/media/title/TitleMid";
import type { MediaType, CreditsResponse } from "../../types/tmdb";
import { useMediaCredits } from "../../hooks/people/useMediaCredits";
import { useMediaDetail } from "../../hooks/media/useMediaDetail";

type RouteParams = {
  media_type: MediaType;
  id: string;
};

const CreditsPage = () => {
  const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast");

  const { media_type = "movie", id: idParam } = useParams<RouteParams>();
  const id = Number(idParam);
  const isValidId = Number.isFinite(id) && id > 0;

  const {
    data: credits,
    isLoading: creditsLoading,
    isError: creditsError,
  } = useMediaCredits(media_type, isValidId ? id : undefined);

  const {
    data: details,
    isLoading: detailsLoading,
    isError: detailsError,
  } = useMediaDetail(media_type, isValidId ? id : undefined);

  const cast = credits?.cast ?? [];
  const crew = credits?.crew ?? [];

  const mediaTitle = details?.title ?? details?.name ?? "Unknown title";

  type CrewMember = CreditsResponse["crew"][number];

  const organizedCrew = useMemo(() => {
    return crew.reduce((acc, member) => {
      const key = member.department || "Other";
      (acc[key] ??= []).push(member);
      return acc;
    }, {} as Record<string, CrewMember[]>);
  }, [crew]);

  if (!isValidId) {
    return (
      <div className="min-h-dvh bg-[var(--background)] grid place-items-center">
        <p className="text-[var(--subtle)]">Invalid media id.</p>
      </div>
    );
  }

  if (creditsLoading || detailsLoading) {
    return (
      <div className="min-h-dvh bg-[var(--background)] grid place-items-center">
        <p className="text-[var(--subtle)]">Loading full cast &amp; crew…</p>
      </div>
    );
  }

  if (creditsError || detailsError) {
    return (
      <div className="min-h-dvh bg-[var(--background)] grid place-items-center">
        <p className="text-red-400">Failed to load credits.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 mt-navbar-offset">

        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <Link
            to={`/media/${media_type}/${id}`}
            className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] mb-4 inline-block transition-colors text-sm"
          >
            ← Back to {mediaTitle}
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold mb-1 text-[var(--text-h1)]">
            {mediaTitle}
          </h1>
          <p className="text-[var(--subtle)] text-base sm:text-lg">
            Full Cast &amp; Crew
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] mb-8 sm:mb-10">
          <button
            onClick={() => setActiveTab("cast")}
            className={`px-5 sm:px-6 py-3 font-semibold transition-colors ${
              activeTab === "cast"
                ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
                : "text-[var(--subtle)] hover:text-[var(--text-h1)]"
            }`}
          >
            Cast ({cast.length})
          </button>
          <button
            onClick={() => setActiveTab("crew")}
            className={`px-5 sm:px-6 py-3 font-semibold transition-colors ${
              activeTab === "crew"
                ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]"
                : "text-[var(--subtle)] hover:text-[var(--text-h1)]"
            }`}
          >
            Crew ({crew.length})
          </button>
        </div>

        {/* Cast Tab */}
        {activeTab === "cast" && (
          <>
            <TitleMid>Actors</TitleMid>
            {cast.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8">
                {cast
                  .slice()
                  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
                  .map((person) => (
                    <MediaCastCard key={person.id} cast={person} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-[var(--subtle)] text-lg">
                  No cast information available.
                </p>
              </div>
            )}
          </>
        )}

        {/* Crew Tab */}
        {activeTab === "crew" && (
          <>
            {crew.length > 0 ? (
              <div className="space-y-10 sm:space-y-14">
                {Object.entries(organizedCrew)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([department, members]) => (
                    <div key={department}>
                      <TitleMid>{department}</TitleMid>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8">
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
              <div className="text-center py-16">
                <p className="text-[var(--subtle)] text-lg">
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
