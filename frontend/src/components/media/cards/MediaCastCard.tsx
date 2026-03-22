import { Link } from "react-router-dom";
import { User } from "lucide-react";
import type { Credit } from "../../../types/tmdb";

type Props = {
  cast?: Credit;

};

const MediaCastCard = ({ cast }: Props) => {
  const name = cast?.name ?? "Unknown";
  const characterName = cast?.character;
  const castId = cast?.id;
  const profilePath = cast?.profile_path;
  const slug = name.toLowerCase().split(" ").join("-");

  const profileImage = profilePath ? (
    <img
      src={`https://image.tmdb.org/t/p/w185${profilePath}`}
      srcSet={`https://image.tmdb.org/t/p/w185${profilePath} 185w, https://image.tmdb.org/t/p/w300${profilePath} 300w`}
      sizes="128px"
      loading="lazy"
      decoding="async"
      alt={name}
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-white/5 text-accent-primary">
      <User className="w-1/2 h-1/2" />
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full text-center">
      {castId ? (
        <Link
          to={`/person/${castId}/${slug}`}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-sm flex items-center justify-center hover:border-2 border-accent-primary hover:scale-105 transition-transform duration-200 cursor-pointer">
            {profileImage}
          </div>
          <h3 className="mt-2 text-sm sm:text-base font-semibold leading-tight line-clamp-2">{name}</h3>
          {characterName && <p className="text-xs sm:text-sm text-subtle italic leading-tight line-clamp-2">{characterName}</p>}
        </Link>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-sm flex items-center justify-center">
            {profileImage}
          </div>
          <h3 className="mt-2 text-sm sm:text-base font-semibold leading-tight line-clamp-2">{name}</h3>
          {characterName && <p className="text-xs sm:text-sm text-subtle italic leading-tight line-clamp-2">{characterName}</p>}
        </div>
      )}
    </div>
  );
};

export default MediaCastCard;
