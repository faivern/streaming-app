// pages/genres/GenreDetailPage.tsx
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import BackLink from "../../components/media/breadcrumbs/BackLink";
import MediaTypeToggle from "../../components/media/grid/MediaTypeToggle";
import GenreDetailGrid from "../../components/media/grid/GenreDetailGrid";

import Loading from "../../components/feedback/Loading";
import Error from "../../components/feedback/Error";

import TitleMid from "../../components/media/title/TitleMid";

import { useInfiniteDiscoverGenre } from "../../hooks/genres/useInfiniteDiscoverGenre";
import InfiniteScrollWrapper from "../../components/ui/InfiniteScrollWrapper";
import type { MediaType } from "../../types/tmdb";

export default function GenreDetailPage() {
  const { genreId } = useParams();
  const [searchParams] = useSearchParams();

  // initial media type from query (?mediaType=tv|movie)
  const initialType: MediaType =
    searchParams.get("mediaType") === "tv" ? "tv" : "movie";
  const [mediaType, setMediaType] = useState<MediaType>(initialType);

  const genreName = searchParams.get("name") || "Unknown Genre";

  // guard invalid/absent id while keeping hooks stable
  const genreIdNum = useMemo(() => {
    const n = Number(genreId);
    return Number.isFinite(n) ? n : undefined;
  }, [genreId]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteDiscoverGenre({
    mediaType,
    genreId: genreIdNum,
  });

  const items = data?.pages.flatMap((p) => p.results) ?? [];

  if (!genreIdNum) {
    return <Error message="Invalid or missing genre id." />;
  }

  const pageLoading = isLoading;

  if (pageLoading) {
    return <Loading message={`Loading ${genreName}...`} />;
  }

  if (isError) {
    return <Error message={`Error loading ${genreName}`} />;
  }

  return (
    <main className="mt-20 md:mt-24 lg:mt-28 xl:mt-32 max-w-7xl mx-auto px-4 py-8">
      <BackLink />
      <TitleMid className="text-3xl">{genreName}</TitleMid>

      <p className="text-lg text-gray-300 italic">
        Explore the best {genreName.toLowerCase()}{" "}
        {mediaType === "tv" ? "shows" : "movies"}
      </p>

      <div className="mt-4">
        <MediaTypeToggle selectedType={mediaType} onToggle={setMediaType} />
      </div>

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
    </main>
  );
}
