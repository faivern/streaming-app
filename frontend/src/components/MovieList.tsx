import React, { useEffect, useState } from "react";
import axios from "axios";

type Movie = {
    id: number;
    title: string;
};

const MovieList: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [error, setError] = useState<string | null>(null);

useEffect(() => {
    axios.get(import.meta.env.VITE_BACKEND_API_URL + '/api/Movies/popular')
        .then((response) => {
            console.log("TMDB API response:", response.data);
            setMovies(response.data.results);
        })
        .catch((error) => {
            console.error("Error fetching movies:", error);
            setError("ERROR: could not fetch movies.");
        });
}, []);

    if (error) {
        return <div>{error}</div>;
    }

    if (!movies) {
        return <div className="p-4">Loading movies...</div>;
    }

    return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Populära filmer</h1>
      <ul className="grid grid-cols-2 gap-4">
        {movies.map((movie) => (
          <li key={movie.id} className="p-4 border rounded shadow">
            <h2 className="font-semibold">{movie.title}</h2>
          </li>
        ))}
      </ul>
    </div>
    );
}

export default MovieList;