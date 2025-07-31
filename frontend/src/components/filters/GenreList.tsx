{/*Re-usable popover wrapper for the navbar.*/}

type Genre = {
    id: number;
    name: string;
}

type Props = {
    genres?: Genre[];
    onGenreSelect?: (genre: Genre) => void;
}

export default function GenreList({ genres, onGenreSelect }: Props) {
    console.log("GenreList received genres:", genres); // Debug log
    
    if (!genres || genres.length === 0) {
        return (
            <div className="text-gray-400 text-sm">
                Loading genres...
            </div>
        );
    }

    return (
        <div className="max-h-80 overflow-y-auto">
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                Browse Genres ({genres.length})
            </h3>
            <ul className="grid grid-cols-2 gap-2">
                {genres.map((genre) => (
                    <li
                        key={genre.id}
                        onClick={() => onGenreSelect?.(genre)}
                        className="text-gray-300 hover:text-white hover:bg-blue-800/50 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm"
                    >
                        {genre.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}