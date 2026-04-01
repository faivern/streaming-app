// src/pages/media/MediaDetailPage.tsx
import { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useMediaDetail } from "../../hooks/media/useMediaDetail";
import type { MediaType } from "../../types/tmdb";
import { useMediaCredits } from "../../hooks/people/useMediaCredits";
import { mediaUrl } from "../../utils/urlBuilder";

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

export default function MediaDetailPage({ mediaType: media_type }: { mediaType: MediaType }) {
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id || "", 10);
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
  const { data: similarMedia = [], isLoading: isSimilarLoading } = useSimilarMedia(media_type, numericId);
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

  const mediaTitle = details.title ?? details.name ?? "Unknown";
  const year = (details.release_date ?? details.first_air_date ?? "").slice(0, 4);
  const pageTitle = year ? `${mediaTitle} (${year}) | Cinelas` : `${mediaTitle} | Cinelas`;
  const description = details.overview
    ? details.overview.slice(0, 160)
    : `Find where to stream ${mediaTitle} and more on Cinelas.`;
  const posterUrl = details.poster_path
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
    : undefined;

  const logoPath =
    details.production_companies?.find((pc) => pc.logo_path)?.logo_path ?? "";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": media_type === "tv" ? "TVSeries" : "Movie",
    name: mediaTitle,
    url: `https://cinelas.com${mediaUrl(media_type, numericId, mediaTitle)}`,
    ...(details.overview && { description: details.overview }),
    ...(posterUrl && { image: posterUrl }),
    ...(details.release_date && { datePublished: details.release_date }),
    ...(details.first_air_date && { datePublished: details.first_air_date }),
    ...(details.genres?.length && {
      genre: details.genres.map((g) => g.name),
    }),
    ...(details.production_companies?.length && {
      productionCompany: details.production_companies.map((pc) => ({
        "@type": "Organization",
        name: pc.name,
      })),
    }),
    ...(details.vote_average != null &&
      details.vote_count != null &&
      details.vote_count > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: details.vote_average.toFixed(1),
          bestRating: "10",
          ratingCount: details.vote_count,
        },
      }),
    ...(media_type === "movie" && details.runtime && {
      duration: `PT${details.runtime}M`,
    }),
    ...(media_type === "tv" && details.number_of_seasons && {
      numberOfSeasons: details.number_of_seasons,
    }),
    ...(details.created_by?.length && {
      creator: details.created_by.map((c) => ({
        "@type": "Person",
        name: c.name,
      })),
    }),
  };

  return (
    <main>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://cinelas.com${mediaUrl(media_type, numericId, mediaTitle)}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`https://cinelas.com${mediaUrl(media_type, numericId, mediaTitle)}`} />
        <meta property="og:type" content="video.movie" />
        {posterUrl && <meta property="og:image" content={posterUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

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
            <MediaGridSimilar similarMedia={similarMedia} parentType={media_type} isLoading={isSimilarLoading} />
          </div>

          {/* col 1, row 2 — watch providers */}
          <div className="order-3 md:order-none py-2 md:py-4 min-w-0">
            <WatchProviders mediaType={media_type} mediaId={numericId} />
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
