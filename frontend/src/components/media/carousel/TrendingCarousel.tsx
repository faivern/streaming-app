import { useEffect, useState, useRef } from "react";
import axios from "axios";
import genreMap from "../../../utils/genreMap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { dateFormat } from '../../../utils/dateFormat';
import { Link } from "react-router-dom";

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
};

export default function Carousel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [detailsCache, setDetailsCache] = useState<{ [id: number]: number }>(
    {}
  );
  const intervalRef = useRef<number | null>(null);
  const intervalTime = 6000;
  const baseImageUrl = "https://image.tmdb.org/t/p/w1280";

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

    if (!isHovered && filtered.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % filtered.length);
      }, intervalTime);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [filtered.length, isHovered]);

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

  useEffect(() => {
    const current = filtered[currentIndex];
    if (current) {
      fetchRuntime(current.media_type || "movie", current.id);
    }
  }, [currentIndex, filtered]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // Manual navigation handlers
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filtered.length);
  };

  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden -mt-40"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
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
              <img
                src={`${baseImageUrl}${movie.backdrop_path}`}
                className="w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out"
                alt={movie.title || movie.name || "Movie backdrop"}
                />
              <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0 pointer-events-none" />
                  </Link>
              <div className="flex flex-col gap-4 absolute bottom-12 left-12 z-10 max-w-xl bg-gray-700/5 p-6 rounded-xl backdrop-blur-sm shadow-lg">
                {/* Row 1: Title */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-white text-3xl font-bold">
                    {movie.title || movie.name}
                  </h2>
                </div>

                {/* Row 2: Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                  <p className="text-sm font-medium bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm 
                  hover:shadow-md hover:border-blue-400 transition flex items-center">
                    <FontAwesomeIcon icon={faStar} className="mr-1 text-amber-400" />
                    {movie.vote_average ? (
                      <>
                        <span className="font-bold">{movie.vote_average.toFixed(1)}</span>
                        <span>/10</span>
                      </>
                    ) : (
                      "No rating"
                    )}
                  </p>
                  <p className="text-sm font-medium bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm hover:shadow-md hover:border-blue-400 transition">
                    {dateFormat(movie.release_date) || "No date"}
                  </p>
                  {Array.isArray(movie.genre_ids) &&
                    movie.genre_ids.map((id) => (
                      <span
                      key={id}
                      className="text-sm font-medium bg-gray-800/70 text-white px-3 py-1 rounded-full border border-gray-600/50 shadow-sm hover:shadow-md hover:border-blue-400 transition"
                      >
                        {genreMap[id] || "Unknown"}
                      </span>
                    ))}

                </div>

                {/* Row 3: Overview */}
                <p className="text-gray-300 text-base leading-relaxed">
                  {movie.overview || "No overview available."}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add seamless transition overlay at bottom of carousel */}

        {/* Dots/Indicators */}
        <div className="absolute bottom-8 left-1/2 z-20 flex gap-2 -translate-x-1/2">
          {filtered.map((_, idx) => (
            <button
            key={idx}
            className={`w-8 h-1 rounded-full transition-all ${
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
