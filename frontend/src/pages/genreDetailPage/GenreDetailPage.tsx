import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import GenreDetailGrid from "../../components/media/grid/GenreDetailGrid";
import MediaTypeToggle from "../../components/media/grid/MediaTypeToggle";
import BackLink from "../../components/media/breadcrumbs/BackLink";
import type { DetailMediaGenre } from "../../types/tmdb";

type detailMediaGenre = {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    genre_ids?: number[];
    original_language?: string;
    vote_count?: number;
    runtime?: number;
    media_type?: string;
    number_of_seasons?: number;
    number_of_episodes?: number;
};

const GenreDetailPage = () => {
    const { genreId } = useParams();
const [searchParams] = useSearchParams();
const initialType = (searchParams.get("mediaType") === "tv") ? "tv" : "movie";
const [mediaType, setMediaType] = useState<"movie" | "tv">(initialType);

    const genreName = searchParams.get("name") || "Unknown Genre";
    const [media, setMedia] = useState<detailMediaGenre[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchGenreMedia = async () => {
            if(!genreId) return;
            
            try {
                setLoading(true);
                setError(false);
                
                // Use your exact backend endpoint structure
                const endpoint = `/api/Movies/discover/by-genre`;
                const params = {
                    mediaType: mediaType,
                    genreId: parseInt(genreId),
                    page: 1
                };
                
                console.log("Fetching from:", `${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`);
                console.log("With params:", params);
                
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}${endpoint}`, { params });

    // Inject media_type into each item
    const withType = (res.data.results || res.data).map((item: detailMediaGenre) => ({
      ...item,
      media_type: mediaType,
    }));

    setMedia(withType);
            } catch (err) {
                console.error("Failed to fetch genre media:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchGenreMedia();
    }, [genreId, mediaType]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
                <div className="text-white text-center">Loading {genreName}...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
                <div className="text-red-400 text-center">Error loading {genreName}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 mt-20">
            <BackLink />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent drop-shadow py-2">
                {genreName}
            </h1>
            <p className="text-lg text-gray-300 italic">Explore the best {genreName.toLowerCase()} {mediaType === "tv" ? "shows" : "movies"}</p>
            <MediaTypeToggle selectedType={mediaType} onToggle={setMediaType} />
            <GenreDetailGrid
                genreMedia={media || []}
                mediaType={mediaType}
            />
        </div>
    )
}

export default GenreDetailPage;