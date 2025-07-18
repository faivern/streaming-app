import React from 'react'
import MediaCastCard from '../media/MediaCastCard.tsx';
import { Link } from 'react-router-dom';

type Props = {
    cast: {
        id: number;
        name: string;
        character?: string;
        profile_path?: string;
    }[]
}

const MediaCastCarousel = ({ cast }: Props) => {
    return (
    <section className="w-full py-8 px-4 md:px-12 max-w-7xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold mb-4">Cast & Crew</h2>
        <Link to="/media/cast">
            <span className="relative text-xl font-semibold mb-4 hover:text-sky-300 cursor-pointer group">
                Explore all
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-sky-300 transition-all duration-300 group-hover:w-full"></span>
            </span>
        </Link>
    </div>

      <div className="flex gap-6 overflow-x-auto px-1">
        {cast.map((person) => (
          <MediaCastCard key={person.id} name={person.name} profile_path={person.profile_path} character={person.character} />
        ))}
      </div>
    </section>
    )
}

export default MediaCastCarousel