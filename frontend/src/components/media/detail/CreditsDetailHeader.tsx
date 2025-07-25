import React from 'react'
import { dateFormatLong } from '../../../utils/dateFormatLong';
import avatarPlaceholder from "../../../images/no-avatar-placeholder.png";
type Props = {
    id: number;
    name: string;
    birthday: string;
    biography?: string;
    known_for_department?: string;
    place_of_birth?: string;
    profile_path?: string;
    gender?: number;
    deathday?: string;
};

const CreditsDetailHeader = ({ id, name, biography, known_for_department, place_of_birth, profile_path, birthday, gender, deathday }: Props) => {
  const birthInfo = birthday ? dateFormatLong(birthday) : "Unknown";
  const placeInfo = place_of_birth ? ` ● ${place_of_birth}` : "";
  return (
<div className="container mx-auto p-6 text-white">
  <div className="flex flex-col md:flex-row gap-6">
    {/* LEFT COLUMN - IMAGE + BASIC INFO */}
    <div className="w-full md:w-1/3 flex flex-col items-center border border-yellow-500 p-4 rounded">
      <h2 className="text-2xl font-bold mb-4">{name || `Person #${id}`}</h2>
      <img
        src={
          profile_path
            ? `https://image.tmdb.org/t/p/w300${profile_path}`
            : avatarPlaceholder
        }
        alt={name}
        className="shadow-lg rounded w-48 h-auto"
      />
      <div className="mt-4 text-sm text-gray-400 space-y-1">
        <p>
          <span className="font-semibold text-white">Born:</span> {birthInfo}
          {placeInfo}
        </p>
        {deathday && (
          <p>
            <span className="font-semibold text-white">Died:</span>{" "}
            {dateFormatLong(deathday)}
          </p>
        )}
        <p>
          <span className="font-semibold text-white">Known for:</span>{" "}
          {known_for_department || "N/A"}
        </p>
      </div>
    </div>

    {/* RIGHT COLUMN - BIOGRAPHY */}
    <div className="w-full md:w-2/3 border border-purple-500 p-4 rounded">
      <h3 className="text-xl font-semibold mb-2">Biography</h3>
      <p className="text-gray-300 whitespace-pre-line">
        {biography || "No biography available."}
      </p>
    </div>
  </div>
</div>

  )
}

export default CreditsDetailHeader