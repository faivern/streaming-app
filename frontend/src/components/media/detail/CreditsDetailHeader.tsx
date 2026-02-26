import { dateFormatLong } from "../../../utils/dateFormatLong";
import { calcAge } from "../../../utils/calcAge";
import { knownForDepartment } from "../../../utils/knownForDepartment";
import { User } from "lucide-react";

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

const CreditsDetailHeader = ({
  id,
  name,
  biography,
  known_for_department,
  place_of_birth,
  profile_path,
  birthday,
  gender,
  deathday,
}: Props) => {
  const birthInfo = birthday ? dateFormatLong(birthday) : "Unknown";
  const age = calcAge(birthday, deathday);
  const placeInfo = place_of_birth ? ` ${place_of_birth}` : "";
  const knownFor = knownForDepartment(known_for_department, gender);

  return (
    <div className="bg-[var(--card)] rounded-2xl p-6 border border-[var(--border)] shadow-lg mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT COLUMN - IMAGE + BASIC INFO */}
        <div className="w-full md:w-1/3 flex flex-col items-center p-4 rounded">
          <div className="text-center md:text-left mb-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-h1)]">
              {name || `Person #${id}`}
            </h2>
            <p className="text-[var(--accent-primary)] text-sm">{knownFor}</p>
          </div>
          {profile_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w300${profile_path}`}
              srcSet={`https://image.tmdb.org/t/p/w185${profile_path} 185w, https://image.tmdb.org/t/p/w300${profile_path} 300w, https://image.tmdb.org/t/p/w500${profile_path} 500w`}
              sizes="256px"
              loading="lazy"
              decoding="async"
              alt={name}
              className="aspect-[2/3] w-64 h-auto rounded-2xl shadow-xl object-cover border border-[var(--border)]"
            />
          ) : (
            <div
              className="aspect-[2/3] w-64 rounded-2xl shadow-xl border border-[var(--border)] flex items-center justify-center bg-[var(--component-primary)] text-[var(--accent-primary)]"
              role="img"
              aria-label={name}
            >
              <User className="w-1/3 h-1/3" />
            </div>
          )}
          <div className="mt-4 text-sm text-[var(--subtle)] space-y-1">
            <div className="flex text-sm text-[var(--subtle)]">
              <div>
                <span className="font-semibold text-[var(--text-h1)]">Born:</span>{" "}
                {birthInfo}
              </div>
              {!deathday && (
                <div className="text-[var(--subtle)] pl-2">
                  {" "}
                  {`(${age} years old)`}
                </div>
              )}
            </div>

            <p>
              <span className="font-semibold text-[var(--text-h1)]">Birthplace:</span>
              {placeInfo}
            </p>
            {deathday && (
              <div className="flex text-sm text-[var(--subtle)]">
              <p>
                <span className="font-semibold text-[var(--text-h1)]">Died:</span>{" "}
                {dateFormatLong(deathday)}
              </p>
              <div className="text-[var(--subtle)] pl-2">
                {`(${age} years old)`}
              </div>
              </div>
            )}
            </div>
          </div>

        {/* RIGHT COLUMN - BIOGRAPHY */}
        <div className="w-full md:w-2/3 p-4 flex items-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">
              Biography
            </h3>
            <div className="h-px w-full bg-gradient-to-r from-[var(--subtle)]/80 to-transparent"></div>
            <p className="text-[var(--subtle)] whitespace-pre-line break-words">
              {biography || "No biography available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsDetailHeader;
