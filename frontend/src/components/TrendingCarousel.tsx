import { useEffect, useState, useRef } from "react";
import axios from "axios";

type Movie = {
  id: number;
  title?: string;
  name?: string;
  backdrop_path?: string;
  media_type?: string;
  vote_average?: number;
  overview?: string;
};

export function Carousel() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const intervalTime = 10000;
  const baseImageUrl = "https://image.tmdb.org/t/p/w1280";
  useEffect(() => {
    axios
      .get(
        import.meta.env.VITE_BACKEND_API_URL + "/api/Movies/trending/all/week"
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

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div className="w-full pb-4">
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-full h-[70vh]">
          {filtered.map((movie, index) => (
            <div
              key={movie.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={`${baseImageUrl}${movie.backdrop_path}`}
                className="w-full h-full object-cover object-top "
                alt={movie.title || movie.name || "Movie backdrop"}
              />
              {/* Gradient fade from bottom */}
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0F172A] via-[#0F172Acc] to-transparent z-10 pointer-events-none" />

              <div className="flex flex-wrap gap-2 absolute bottom-12 left-12 z-20">
                <h2 className=" text-white text-3xl font-bold">
                  {movie.title || movie.name}
                </h2>
                <p className="text-md font-medium bg-gray-800/55 text-gray-300 px-3 py-1 rounded-full flex items-center justify-center mt-1">
                  {movie.vote_average
                    ? `⭐ ${movie.vote_average.toFixed(1)} / 10`
                    : "No rating"}
                </p>
                <p className="text-gray-300 text-lg mt-2 w-full">
                  {movie.overview
                    ? movie.overview.slice(0, 150) + "..."
                    : "No overview available."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Carousel;
