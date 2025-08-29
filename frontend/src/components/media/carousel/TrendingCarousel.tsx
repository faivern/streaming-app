import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Backdrop from "../../media/shared/Backdrop";

import RatingPill from "../../ui/RatingPill";
import GenrePill from "../../ui/GenrePill";
import DatePill from "../../ui/DatePill";
import EnhancedTitle from "../../media/shared/EnhancedTitle";

type Movie = {
  id: number;
  title?: string;
  name?: string;
  backdrop_path?: string;
  media_type?: string;
  vote_average?: number;
  overview?: string;
  release_date?: string;
  genre_ids?: number[];
  first_air_date?: string;
  logo_path?: string; // Add this
};


export default function Carousel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailsCache, setDetailsCache] = useState<{ [id: number]: number }>(
    {}
  );
  const [logosCache, setLogosCache] = useState<{ [id: number]: string | null }>(
    {}
  );
  const intervalRef = useRef<number | null>(null);
  const intervalTime = 6000;

  useEffect(() => {
    axios
      .get(
        import.meta.env.VITE_BACKEND_API_URL + "/api/Movies/trending/all/day"
      )
      .then((res) => setMovies(res.data.results))
      .catch((err) => console.error("Error fetching movies:", err));
  }, []);

  const filtered = movies.filter(
    (movie) =>
      (movie.media_type === "movie" || movie.media_type === "tv") &&
      movie.backdrop_path
  );

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (filtered.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % filtered.length);
      }, intervalTime);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [filtered.length]);

  const fetchRuntime = async (mediaType: string, id: number) => {
    if (detailsCache[id] !== undefined) return;

    try {
      const endpoint =
        mediaType === "movie"
          ? `/api/Movies/movie/${id}`
          : `/api/Movies/tv/${id}`;

      const res = await axios.get(
        import.meta.env.VITE_BACKEND_API_URL + endpoint
      );
      const runtime =
        mediaType === "movie"
          ? res.data.runtime
          : res.data.episode_run_time?.[0] ?? 0;

      setDetailsCache((prev) => ({ ...prev, [id]: runtime }));
    } catch (err) {
      console.error("Runtime fetch failed:", err);
    }
  };

  // Add this function to fetch logos
  const fetchLogo = async (mediaType: string, id: number) => {
    if (logosCache[id] !== undefined) return;

    try {
      const endpoint =
        mediaType === "movie"
          ? `/api/Movies/movie/${id}/images`
          : `/api/Movies/tv/${id}/images`;

      const res = await axios.get(
        import.meta.env.VITE_BACKEND_API_URL + endpoint
      );

      // Find English logo or fallback to first available
      const logos = res.data.logos || [];
      const englishLogo = logos.find((logo: any) => logo.iso_639_1 === "en");
      const logoPath = englishLogo?.file_path || logos[0]?.file_path || null;

      setLogosCache((prev) => ({ ...prev, [id]: logoPath }));
    } catch (err) {
      console.error("Logo fetch failed:", err);
      setLogosCache((prev) => ({ ...prev, [id]: null }));
    }
  };

  useEffect(() => {
    const current = filtered[currentIndex];
    if (current) {
      fetchRuntime(current.media_type || "movie", current.id);
      fetchLogo(current.media_type || "movie", current.id); // Add this line
    }
  }, [currentIndex, filtered]);

  // Manual navigation handlers
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filtered.length);
  };

  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden -mt-40">
        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          aria-label="Previous"
          disabled={filtered.length === 0}
          className="absolute left-6 top-1/2 z-20 -translate-y-1/2 bg-gray-900/50 backdrop-blur-md text-white 
  hover:bg-gray-800/80 disabled:opacity-40 disabled:cursor-not-allowed 
  rounded-full p-3 transition-all duration-200 shadow-md border border-gray-700/30 
  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500/40 cursor-pointer"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
        </button>

        <button
          onClick={goToNext}
          aria-label="Next"
          disabled={filtered.length === 0}
          className="absolute right-6 top-1/2 z-20 -translate-y-1/2 bg-gray-900/50 backdrop-blur-md text-white 
  hover:bg-gray-800/80 disabled:opacity-40 disabled:cursor-not-allowed 
  rounded-full p-3 transition-all duration-200 shadow-md border border-gray-700/30 
  hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500/40"
        >
          <FontAwesomeIcon icon={faChevronRight} className="text-xl" />
        </button>

        <div className="relative w-full h-[60vh] md:h-[65vh] lg:h-[66vh] xl:h-[68vh] mb-6 transition-all duration-300 ease-in-out shadow-lg overflow-hidden">
          {filtered.map((movie, index) => (
            <div
              key={movie.id}
              className={`absolute inset-0 transition-opacity duration-800 ${
                index === currentIndex
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Link to={`/media/${movie.media_type}/${movie.id}`}>
                {/* Gradient overlay for better text visibility */}
                <div className="absolute bottom-0 left-0 w-full h-15 bg-gradient-to-b from-transparent to-gray-900 z-10"></div>

                {/* Backdrop */}
                <Backdrop
                  path={movie.backdrop_path}
                  alt={movie.title || movie.name || "Movie backdrop"}
                  className="w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out"
                  sizes="100vw"
                  priority={index === currentIndex}
                />

                <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0 pointer-events-none" />
              </Link>
              <div className="flex flex-col gap-4 absolute bottom-12 left-12 z-20 max-w-xl bg-gray-700/5 p-6 rounded-xl backdrop-blur-sm shadow-lg">
                {/* Row 1: Logo or Title */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {logosCache[movie.id] ? (
                    <EnhancedTitle
                      path={logosCache[movie.id]}
                      alt={movie.title || movie.name || "Movie logo"}
                      className="max-h-16 w-auto max-w-xs object-contain"
                      sizes="(max-width: 768px) 200px, 300px"
                    />
                  ) : (
                    <h2 className="text-white text-3xl font-bold">
                      {movie.title || movie.name}
                    </h2>
                  )}
                </div>

                {/* Row 2: Metadata */}
                <div className="space-y-2" aria-label="Media metadata">
                  <div className="flex flex-wrap items-center gap-4 pb-1">
                  {movie.vote_average != null && movie.vote_average > 0 && (
                    <RatingPill
                    rating={movie.vote_average}
                    className="!bg-transparent !border-0 !shadow-none !px-0 !py-0 text-gray-200"
                    />
                  )}
                  {(movie.release_date || movie.first_air_date) && (
                    <DatePill
                    date={movie.release_date || movie.first_air_date}
                    className="!bg-transparent !border-0 !shadow-none !px-0 !py-0 text-gray-400"
                    title="Release date"
                    />
                  )}
                  </div>

                  {movie.genre_ids?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {movie.genre_ids.slice(0, 3).map((id) => (
                    <GenrePill
                      key={id}
                      id={id}
                      className="bg-gray-700/40 border border-gray-600/40"
                    />
                    ))}
                  </div>
                  ) : (
                  <div className="text-xs text-gray-500 italic">
                    No genres
                  </div>
                  )}
                </div>

                {/* Row 3: Overview */}
                <p className="text-gray-300 text-base leading-relaxed line-clamp-4">
                  {movie.overview || "No overview available."}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dots/Indicators */}
        <div className="absolute bottom-8 left-1/2 z-20 flex gap-2 -translate-x-1/2">
          {filtered.map((_, idx) => (
            <button
              key={idx}
              className={`w-8 h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-sky-500 scale-125 shadow hover:cursor-pointer"
                  : "bg-gray-400/60 hover:bg-blue-300/80 cursor-pointer"
              }`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{ outline: "none" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
