// pages/genres/GenreDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

import BackLink from "../../components/media/breadcrumbs/BackLink";
import MediaTypeToggle from "../../components/media/grid/MediaTypeToggle";
import GenreDetailGrid from "../../components/media/grid/GenreDetailGrid";

import Loading from "../../components/feedback/Loading";
import Error from "../../components/feedback/Error";

import TitleMid from "../../components/media/title/TitleMid";

import { useInfiniteDiscoverGenre } from "../../hooks/genres/useInfiniteDiscoverGenre";
import { useGenreById } from "../../hooks/genres/useGenreById";
import InfiniteScrollWrapper from "../../components/ui/InfiniteScrollWrapper";
import type { MediaType } from "../../types/tmdb";

export default function GenreDetailPage() {
  const { genreId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const genreName = searchParams.get("name") || "Unknown Genre";

  // guard invalid/absent id while keeping hooks stable
  const genreIdNum = useMemo(() => {
    const n = Number(genreId);
    return Number.isFinite(n) ? n : undefined;
  }, [genreId]);

  // Get genre metadata to know which media types are supported
  const {
    genre,
    supportsBoth,
    defaultMediaType,
    isLoading: genreLoading,
  } = useGenreById(genreIdNum);

  // Get media type from URL, fallback to defaultMediaType
  const urlMediaType = searchParams.get("mediaType") as MediaType | null;
  const [mediaType, setMediaType] = useState<MediaType>("movie");

  // Sync media type with URL and validate against supported types
  useEffect(() => {
    // Wait for genre data to load
    if (genreLoading || !genreIdNum) return;

    // If we have genre data, validate the URL's media type
    if (genre) {
      const isUrlTypeValid =
        urlMediaType &&
        genre.supportedMediaTypes.includes(urlMediaType);

      if (isUrlTypeValid) {
        setMediaType(urlMediaType);
      } else {
        // URL has invalid or missing media type - redirect to valid one
        const validType = defaultMediaType;
        setMediaType(validType);

        // Update URL to reflect the valid media type
        const newParams = new URLSearchParams(searchParams);
        newParams.set("mediaType", validType);
        navigate(`/genre/${genreIdNum}?${newParams.toString()}`, {
          replace: true,
        });
      }
    } else {
      // Genre not found in our data, use URL type or default
      setMediaType(urlMediaType || "movie");
    }
  }, [
    genre,
    genreLoading,
    genreIdNum,
    urlMediaType,
    defaultMediaType,
    navigate,
    searchParams,
  ]);

  const handleToggle = (type: MediaType) => {
    setMediaType(type);
    // Update URL when toggling
    const newParams = new URLSearchParams(searchParams);
    newParams.set("mediaType", type);
    navigate(`/genre/${genreIdNum}?${newParams.toString()}`, { replace: true });
  };

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

  const pageLoading = isLoading || genreLoading;

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

      {/* Only show toggle when genre supports both media types */}
      {supportsBoth && (
        <div className="mt-4">
          <MediaTypeToggle selectedType={mediaType} onToggle={handleToggle} />
        </div>
      )}

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
