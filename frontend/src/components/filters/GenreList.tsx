{/*Re-usable popover wrapper for the navbar.*/}
import { useNavigate } from 'react-router-dom';
import type { EnrichedGenre, MediaType } from '../../types/tmdb';

type Props = {
    genres?: EnrichedGenre[];
}

export default function GenreList({ genres }: Props) {
    const navigate = useNavigate();

    if (!genres || genres.length === 0) {
        return (
            <div className="text-gray-400 text-sm">
                Loading genres...
            </div>
        );
    }

    const getDefaultMediaType = (genre: EnrichedGenre): MediaType => {
        return genre.supportedMediaTypes?.includes("movie") ? "movie" : "tv";
    };

    return (
        <div className="max-h-80 overflow-y-auto">
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                Browse Genres
            </h3>
            <ul className="grid grid-cols-3 gap-1">
                {genres.map((genre) => (
                    <li
                        key={genre.id}
                        onClick={() =>
                            navigate(`/genre/${genre.id}?mediaType=${getDefaultMediaType(genre)}&name=${encodeURIComponent(genre.name)}`)
                        }
                        className="text-gray-300 hover:text-white hover:bg-sky-500/20 px-2 py-2 rounded-md cursor-pointer transition-colors text-sm"
                    >
                        {genre.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
