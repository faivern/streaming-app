import React from 'react'
import genreMap from '../../utils/genreMap';


type MediaCardModalProps = {
  title: string;
  backdrop?: string;
  overview?: string;
  releaseDate?: string;
  vote_average?: number;
  genreIds?: number[];
  
};

const MediaCardModal = ({title, overview, releaseDate, vote_average, backdrop, genreIds}: MediaCardModalProps) => {
  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 min-w-96 p-4 shadow-lg rounded-lg border border-gray-600/30 text-white">
      <h2 className="text-xl font-bold mb-2 text-blue-300">{title}</h2>
      {backdrop && (
        <img
          src={`https://image.tmdb.org/t/p/w500${backdrop}`}
          alt={title}
          className="w-full h-32 object-cover rounded-sm mb-2"
        />
      )}
      <p className="text-sm text-gray-300 mb-2 line-clamp-4">{overview || "No description"}</p>
      <div className="text-sm text-gray-400 space-y-1">
      <p><strong>Release: </strong>{releaseDate|| "No date"}</p>
      <p><strong>IMDB: </strong>{vote_average?.toFixed(1)||"No rating"} / 10</p>
      {genreIds && genreIds.length > 0 && (
        <p>
          <strong>Genres: </strong>
          {genreIds.map((id) => genreMap[id] || "Unknown").join(", ")}
        </p>
      )}
       </div>
      </div>
  )
}

export default MediaCardModal