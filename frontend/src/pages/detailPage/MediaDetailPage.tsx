// src/pages/media/MediaDetailPage.tsx
import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useMediaDetail } from "../../hooks/media/useMediaDetail";
import type { MediaType } from "../../types/tmdb";
import { useMediaCredits } from "../../hooks/people/useMediaCredits";

import BackLink from "../../components/media/breadcrumbs/BackLink";
import MediaDetailVideoSkeleton from "../../components/media/skeleton/MediaDetailVideoSkeleton";
import MediaDetailVideo from "../../components/media/detail/MediaDetailVideo";
import MediaDetailHeader from "../../components/media/detail/MediaDetailHeader";
import MediaCastCarousel from "../../components/media/carousel/MediaCastCarousel";
import MediaGridSimilar from "../../components/media/grid/MediaGridSimilar";
import WatchProviders from "../../components/media/WatchProviders";
import AddToListModal from "../../components/lists/modals/AddToListModal";
import useToWatch from "../../hooks/useToWatch";
import { useSimilarMedia } from "../../hooks/media/useSimilarMedia";
import { useMediaKeywords } from "../../hooks/media/useMediaKeywords";

export default function MediaDetailPage() {
  const { media_type, id } = useParams<{ media_type: MediaType; id: string }>();
  const numericId = Number(id); // important: route param -> number
  const { isPlaying, handleWatchNow } = useToWatch();
  const [addToListModalOpen, setAddToListModalOpen] = useState(false);

  const scrollToWatchProviders = useCallback(() => {
    document.getElementById("watch-providers")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (!media_type || !id) {
    return <div>Invalid media type or ID.</div>;
  }

  const { data: details, isLoading, isError, } = useMediaDetail(media_type, numericId);
  const { data: credits } = useMediaCredits(media_type, numericId);
  const { data: similarMedia = [] } = useSimilarMedia(media_type, numericId);
  const { data: keywords = [] } = useMediaKeywords(media_type, numericId);

  if (isLoading) {
    return (
      <main>
        <div className="max-w-7xl mx-auto px-4 py-8 mt-navbar-offset">
          <BackLink />
          <MediaDetailVideoSkeleton />
        </div>
      </main>
    );
  }

  if (isError || !details) return <div>Error loading media details.</div>;

  const logoPath =
    details.production_companies?.find((pc) => pc.logo_path)?.logo_path ?? "";

  return (
    <main>
      {/* BackLink — always has navbar offset now that hero backdrop is removed */}
      <div className="px-4 md:px-[8%] 4xl:px-[12%] mt-navbar-offset">
        <BackLink />
      </div>

      {/* Mobile trailer — hero position, full-width */}
      <div className="md:hidden px-4 mt-2">
        <MediaDetailVideo
          backdrop_path={details.backdrop_path ?? ""}
          poster_path={details.poster_path ?? ""}
          title={details.title ?? details.name ?? "Media Trailer"}
          isPlaying={isPlaying}
          media_type={media_type}
          id={numericId}
          onScrollToWatchProviders={scrollToWatchProviders}
          onAddToList={() => setAddToListModalOpen(true)}
        />
      </div>

      {/* Desktop: trailer above 2-column layout, ~78% viewport width */}
      <div className="hidden md:block w-[78%] mx-auto mt-4">
        <MediaDetailVideo
          backdrop_path={details.backdrop_path ?? ""}
          poster_path={details.poster_path ?? ""}
          title={details.title ?? details.name ?? "Media Trailer"}
          isPlaying={isPlaying}
          media_type={media_type}
          id={numericId}
          onScrollToWatchProviders={scrollToWatchProviders}
          onAddToList={() => setAddToListModalOpen(true)}
        />
      </div>

      <div className="px-4 md:px-[8%] 4xl:px-[12%] mt-4">
        <div className="flex flex-col md:grid md:grid-cols-[1fr_auto] gap-6 md:gap-8 md:gap-x-12">
          {/* col 1, row 1 — header (poster+info on mobile) */}
          <div className="order-1 md:order-none min-w-0">
            <MediaDetailHeader
              details={details}
              cast={credits?.cast ?? []}
              crew={credits?.crew ?? []}
              keywords={(keywords ?? []).map((k) => k.name)}
              media_type={media_type}
              onWatchNow={handleWatchNow}
              logo_path={logoPath}
            />
          </div>

          {/* col 2, rows 1-3 — similar media sidebar (pushed to end on mobile) */}
          <div className="order-6 md:order-none mt-4 md:mt-0 md:row-span-3 md:col-start-2 min-w-0">
            <MediaGridSimilar similarMedia={similarMedia} parentType={media_type} />
          </div>

          {/* col 1, row 2 — watch providers */}
          <div className="order-3 md:order-none py-2 md:py-4 min-w-0">
            <WatchProviders mediaType={media_type} mediaId={numericId} title={details.title ?? details.name} />
          </div>

          {/* col 1, row 3 — cast carousel */}
          <div className="order-4 md:order-none min-w-0">
            <MediaCastCarousel cast={credits?.cast ?? []} />
          </div>
        </div>
      </div>

      <AddToListModal
        isOpen={addToListModalOpen}
        onClose={() => setAddToListModalOpen(false)}
        media={{
          tmdbId: numericId,
          mediaType: media_type,
          title: details.title ?? details.name ?? "",
          posterPath: details.poster_path ?? null,
          backdropPath: details.backdrop_path ?? null,
          overview: details.overview ?? null,
          voteAverage: details.vote_average ?? null,
        }}
      />
    </main>
  );
}
