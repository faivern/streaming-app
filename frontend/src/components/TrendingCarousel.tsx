import { useEffect, useState } from "react";
import axios from "axios";

type Movie = {
    id: number;
    title?: string;
    name?: string;
    backdrop_path?: string;
    media_type?: string; // "movie" | "tv"
};

export function CarouselTransition() {
    const [movies, setMovies] = useState<Movie[]>([]);

    useEffect(() => {
        axios
            .get(import.meta.env.VITE_BACKEND_API_URL + '/api/Movies/trending/all/week')
            .then((res) => setMovies(res.data.results))
            .catch((err) => console.error("Error fetching movies:", err));
    }, []);

    const imageBaseUrl = "https://image.tmdb.org/t/p/w1280";

    const filteredMovies = movies.filter(
        (movie) => 
            (movie.media_type === "movie" || movie.media_type === "tv") &&
             movie.backdrop_path !== null
    );


    return (
<div className="w-full p-4">
  <Carousel>
    {filteredMovies.map((movie) => (
        <div key={movie.id} className="relative h-full w-full">
      <img
        key={movie.id}
        src={`${imageBaseUrl}${movie.backdrop_path}`}
        alt={movie.title || movie.name}
        className="h-full w-full object-cover"
      />
      <h2 className="absolute bottom-4 left-4 text-white text-2xl font-bold">
        {movie.title || movie.name}
        </h2>
      </div>
    ))}
  </Carousel>
</div>

    );
}

export default CarouselTransition;
