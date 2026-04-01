{/*Re-usable popover wrapper for the navbar.*/}
import { useNavigate } from 'react-router-dom';
import type { EnrichedGenre, MediaType } from '../../types/tmdb';
import { genreUrl } from '../../utils/urlBuilder';

type Props = {
    genres?: EnrichedGenre[];
}

export default function GenreList({ genres }: Props) {
    const navigate = useNavigate();

    if (!genres || genres.length === 0) {
        return (
            <div className="text-subtle text-sm">
                Loading genres...
            </div>
        );
    }

    const getDefaultMediaType = (genre: EnrichedGenre): MediaType => {
        return genre.supportedMediaTypes?.includes("movie") ? "movie" : "tv";
    };

    return (
        <div className="max-h-80 overflow-y-auto">
            <ul className="grid grid-cols-3 gap-1">
                {genres.map((genre) => (
                    <li
                        key={genre.id}
                        onClick={() =>
                            navigate(genreUrl(genre.id, genre.name, getDefaultMediaType(genre)))
                        }
                        className="text-subtle hover:text-text-h1 hover:bg-accent-primary/20 px-2 py-2 rounded-md cursor-pointer transition-colors text-sm"
                    >
                        {genre.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
