// pages/genres/GenreDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Film, Tv } from "lucide-react";

import BackLink from "../../components/media/breadcrumbs/BackLink";
import MediaTypeToggle from "../../components/media/grid/MediaTypeToggle";
import GenreDetailGrid from "../../components/media/grid/GenreDetailGrid";

import Loading from "../../components/feedback/Loading";
import Error from "../../components/feedback/Error";

import TitleMid from "../../components/media/title/TitleMid";

import { useInfiniteDiscoverGenre } from "../../hooks/genres/useInfiniteDiscoverGenre";
import { useGenreById } from "../../hooks/genres/useGenreById";
import { useGenresWithBackdrops } from "../../hooks/genres/useGenresWithBackdrops";
import { getDiscoverGenre } from "../../api/genres.api";
import InfiniteScrollWrapper from "../../components/ui/InfiniteScrollWrapper";
import SortByDropdown from "../../components/discover/filters/SortByDropdown";
import Backdrop from "../../components/media/shared/Backdrop";
import type { MediaType } from "../../types/tmdb";
import { genreUrl as buildGenreUrl } from "../../utils/urlBuilder";

export default function GenreDetailPage() {
  const { genreId, mediaType: urlMediaType } = useParams<{ genreId: string; mediaType?: string }>();
  const navigate = useNavigate();

  // guard invalid/absent id while keeping hooks stable
  const genreIdNum = useMemo(() => {
    const n = parseInt(genreId || "", 10);
    return Number.isFinite(n) ? n : undefined;
  }, [genreId]);

  // Get genre metadata to know which media types are supported
  const {
    genre,
    supportsBoth,
    defaultMediaType,
    isLoading: genreLoading,
  } = useGenreById(genreIdNum);

  const genreName = genre?.name ?? "Unknown Genre";

  // Get media type from URL path param, fallback to defaultMediaType
  const [mediaType, setMediaType] = useState<MediaType>((urlMediaType as MediaType) || "movie");
  const [sortBy, setSortBy] = useState<string>("popularity.desc");

  // Sync media type with URL and validate against supported types
  useEffect(() => {
    // Wait for genre data to load
    if (genreLoading || !genreIdNum) return;

    // If we have genre data, validate the URL's media type
    if (genre) {
      const isUrlTypeValid =
        urlMediaType &&
        genre.supportedMediaTypes.includes(urlMediaType as MediaType);

      if (isUrlTypeValid) {
        setMediaType(urlMediaType as MediaType);
      } else {
        // URL has invalid or missing media type - redirect to valid one
        const validType = defaultMediaType;
        setMediaType(validType);

        // Update URL to reflect the valid media type
        navigate(buildGenreUrl(genreIdNum, genreName, validType), {
          replace: true,
        });
      }
    } else {
      // Genre not found in our data, use URL type or default
      setMediaType((urlMediaType as MediaType) || "movie");
    }
  }, [
    genre,
    genreLoading,
    genreIdNum,
    genreName,
    urlMediaType,
    defaultMediaType,
    navigate,
  ]);

  const handleToggle = (type: MediaType) => {
    setMediaType(type);
    // Update URL when toggling
    if (genreIdNum) {
      navigate(buildGenreUrl(genreIdNum, genreName, type), { replace: true });
    }
  };

  const { data: genresWithBackdrops } = useGenresWithBackdrops();
  const backdropPath =
    genresWithBackdrops?.find((g) => g.id === genreIdNum)?.backdropPath ??
    undefined;

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
    sortBy,
  });

  const items = data?.pages.flatMap((p) => p.results) ?? [];

  // Fetch counts for both media types (just first page to get total_results)
  const { data: movieCountData } = useQuery({
    queryKey: ["genre", "count", "movie", genreIdNum],
    queryFn: () =>
      getDiscoverGenre({
        mediaType: "movie",
        genreId: genreIdNum!,
        page: 1,
      }),
    enabled: Boolean(genreIdNum),
    staleTime: 5 * 60 * 1000,
  });

  const { data: tvCountData } = useQuery({
    queryKey: ["genre", "count", "tv", genreIdNum],
    queryFn: () =>
      getDiscoverGenre({
        mediaType: "tv",
        genreId: genreIdNum!,
        page: 1,
      }),
    enabled: Boolean(genreIdNum),
    staleTime: 5 * 60 * 1000,
  });

  const movieCount = movieCountData?.total_results ?? 0;
  const tvCount = tvCountData?.total_results ?? 0;
  const totalMediaCount = movieCount + tvCount;

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
    <main className="mt-navbar-offset max-w-7xl mx-auto px-4 py-8">
      <Helmet>
        <title>{`${genreName} Movies & Shows | Cinelas`}</title>
        <meta name="description" content={`Discover ${genreName} movies and TV shows. Browse popular and top-rated ${genreName} titles on Cinelas.`} />
        <link rel="canonical" href={`https://cinelas.com${buildGenreUrl(genreIdNum!, genreName, mediaType)}`} />
        <meta property="og:title" content={`${genreName} Movies & Shows | Cinelas`} />
        <meta property="og:description" content={`Discover ${genreName} movies and TV shows on Cinelas.`} />
        <meta property="og:url" content={`https://cinelas.com${buildGenreUrl(genreIdNum!, genreName, mediaType)}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <BackLink />

      {/* Hero section */}
      <section className="relative overflow-hidden rounded-xl border border-slate-600/30 shadow-lg mb-6">
        <Backdrop
          path={backdropPath}
          alt={genreName}
          className="w-full h-56 md:h-72 lg:h-80"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-5 left-6">
          <TitleMid className="text-3xl">{genreName}</TitleMid>
          <p className="text-lg text-gray-300 italic">
            Explore the best {genreName.toLowerCase()}{" "}
            {supportsBoth ? "titles" : mediaType === "tv" ? "shows" : "movies"}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-2">
            <span className="flex items-center gap-1">
              <Film className="w-4 h-4 text-accent-primary" />
              {movieCount.toLocaleString()}{" "}
              {movieCount === 1 ? "Movie" : "Movies"}
            </span>
            <span className="flex items-center gap-1">
              <Tv className="w-4 h-4 text-accent-primary" />
              {tvCount.toLocaleString()}{" "}
              {tvCount === 1 ? "TV Show" : "TV Shows"}
            </span>
            <span>•</span>
            <span>{totalMediaCount.toLocaleString()} Total</span>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          {supportsBoth && (
            <MediaTypeToggle selectedType={mediaType} onToggle={handleToggle} compact />
          )}
        </div>
        <div>
          <SortByDropdown value={sortBy} onChange={setSortBy} />
        </div>
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
