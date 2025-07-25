import React from 'react'
import avatarPlaceholder from "../../../images/no-avatar-placeholder.png";
import { Link } from "react-router-dom";

type Props = {
    id: number;
    name: string;
    profile_path?: string;
    character?: string;
};

const MediaCastCard = ({ id, name, profile_path, character }: Props) => {

  return (
    <div className="flex flex-col items-center min-w-[120px] w-[120px] flex-shrink-0 text-center mb-4">
 <Link to={`/person/${id}/${name.toLowerCase().split(" ").join("-")}`} className="group">
      <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-sm flex items-center justify-center hover:border-2 border-sky-300 hover:scale-105 transition-transform duration-200 cursor-pointer">
        <img
          src={profile_path
            ? `https://image.tmdb.org/t/p/w200${profile_path}`
            : avatarPlaceholder
          }
          alt={name}
          className="w-full h-full object-cover"
          />
      </div>
          </Link>
      <h3 className="mt-2 text-lg font-semibold">{name}</h3>
      {character && <p className="text-sm text-gray-500 italic truncate">{character}</p>}
    </div>
  )
}

export default MediaCastCard