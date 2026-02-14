import { Link, useParams } from "react-router-dom";
import { User } from "lucide-react";
import type { Credit } from "../../../types/tmdb";

type Props = {
  cast?: Credit;
  
};

const MediaCastCard = ({ cast }: Props) => {
  const { media_type, id: mediaId } = useParams<{ media_type: string; id: string }>();
  const name = cast?.name ?? "Unknown";
  const characterName = cast?.character;
  const castId = cast?.id;
  const profilePath = cast?.profile_path;

  return (
    <div className="flex flex-col items-center min-w-[120px] w-[120px] flex-shrink-0 text-center mb-4">
      {castId ? (
        <Link to={`/person/${castId}/${name.toLowerCase().split(" ").join("-")}?from=${media_type}&mediaId=${mediaId}`}>
          <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-sm flex items-center justify-center hover:border-2 border-accent-primary hover:scale-105 transition-transform duration-200 cursor-pointer">
            {profilePath ? (
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
            )}
          </div>
        </Link>
      ) : (
        <div className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-sm flex items-center justify-center">
          {profilePath ? (
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
          )}
        </div>
      )}
      <h3 className="mt-2 text-lg font-semibold">{name}</h3>
      {characterName && <p className="text-sm text-subtle italic">{characterName}</p>}
    </div>
  );
};

export default MediaCastCard;