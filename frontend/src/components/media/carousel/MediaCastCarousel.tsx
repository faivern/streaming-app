import React from 'react'
import MediaCastCard from '../cards/MediaCastCard.tsx';
import { Link, useParams } from 'react-router-dom';
import "../../../style/TitleHover.css";

type Props = {
    cast: {
        id: number;
        name: string;
        character?: string;
        profile_path?: string;
    }[]
}

const MediaCastCarousel = ({ cast }: Props) => {
    const { media_type, id } = useParams<{ media_type: string; id: string }>();

    return (
    <section className="w-full py-2 px-4 md:px-12 max-w-7xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold">Cast & Crew</h2>
        <Link to={`/media/${media_type}/${id}/credits`}>
          <span className="underline-hover">
            Explore all
            <span className="underline-bar"></span>
          </span>
        </Link>
    </div>

      <div className="flex gap-6 overflow-x-auto px-2 py-2">
        {cast.slice(0, 12).map((person) => (
          <MediaCastCard 
            key={person.id} 
            name={person.name} 
            profile_path={person.profile_path} 
            character={person.character}
            id={person.id}
          />
        ))}
      </div>
    </section>
    )
}

export default MediaCastCarousel