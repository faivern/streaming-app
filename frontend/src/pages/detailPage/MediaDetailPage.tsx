// src/pages/media/MediaDetailPage.tsx
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
import useToWatch from "../../hooks/useToWatch";
import { useSimilarMedia } from "../../hooks/media/useSimilarMedia";
import { useMediaKeywords } from "../../hooks/media/useMediaKeywords";

export default function MediaDetailPage() {
  const { media_type, id } = useParams<{ media_type: MediaType; id: string }>();
  const numericId = Number(id); // important: route param -> number
  const { isPlaying, handleWatchNow } = useToWatch();

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
        <div className="max-w-7xl mx-auto px-4 py-8">
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackLink />
        <MediaDetailVideo
          backdrop_path={details.backdrop_path ?? ""}
          poster_path={details.poster_path ?? ""}
          title={details.title ?? details.name ?? "Media Trailer"}
          isPlaying={isPlaying}
          media_type={media_type}
          id={numericId}
        />
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent-foreground to-transparent" />

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-3/4 w-full">
          <MediaDetailHeader
            details={details}
            cast={credits?.cast ?? []}
            crew={credits?.crew ?? []}
            keywords={(keywords ?? []).map((k) => k.name)}
            media_type={media_type}
            onWatchNow={handleWatchNow}
            logo_path={logoPath}
          />
          <div className="mt-8 m-4 py-8 px-4 md:px-12 max-w-7xl mx-auto">
            <WatchProviders mediaType={media_type} mediaId={numericId} />
          </div>
          <div className="mt-8">
            <MediaCastCarousel cast={credits?.cast ?? []} />
          </div>
        </div>

        <div className="md:w-1/4 w-full">
          <MediaGridSimilar similarMedia={similarMedia} />
        </div>
      </div>
    </main>
  );
}
