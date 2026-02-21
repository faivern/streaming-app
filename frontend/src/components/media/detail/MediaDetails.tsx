import { useState } from "react";
import { dateFormat } from "../../../utils/dateFormat";
import languageMap from "../../../utils/languageMap";
import { keywordsFormat } from "../../../utils/keywordsFormat";
import { getDirector, getMainCast, getCreatorsString } from "../../../utils/creditsUtils";
import { moneyFormat } from "../../../utils/moneyFormat";
import type { MediaType } from "../../../types/tmdb";

type CastMember = {
  id: number;
  name: string;
  character?: string;
  profile_path?: string;
  order?: number;
};

type CrewMember = {
  id: number;
  name: string;
  job: string;
};

type ProductionCompany = {
  id: number;
  name: string;
};

type Creator = {
  id: number;
  name: string;
  profile_path?: string | null;
};

type Props = {
  cast: CastMember[];
  crew: CrewMember[];
  release_date: string;
  country?: string;
  language?: string;
  production_companies?: ProductionCompany[];
  keywords?: string[];
  budget?: number;
  revenue?: number;
  media_type?: MediaType;
  created_by?: Creator[];
};

export default function MediaDetails({
  cast,
  crew,
  release_date,
  country,
  language,
  production_companies,
  keywords = [],
  budget,
  revenue,
  media_type,
  created_by,
}: Props) {
  const [keywordsExpanded, setKeywordsExpanded] = useState(false);

  const director = getDirector(crew);
  const mainCast = getMainCast(cast);
  const isTV = media_type === "tv";
  const creatorsString = getCreatorsString(created_by);

  function DetailRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
    return (
      <div>
        <span aria-label={label} title={label} className="text-slate-400 text-sm font-medium block">
          {label}
        </span>
        <span className={`text-white font-medium ${valueClassName ?? ""}`}>
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-component-primary rounded-2xl p-6 border border-accent-foreground/60 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
        <div className="space-y-4">
          <DetailRow label="Release Date" value={dateFormat(release_date) || "N/A"} />
          <DetailRow label="Language" value={language ? languageMap[language] || "Unknown" : "Unknown"} />
          <DetailRow label="Country" value={country || "N/A"} />
          <div>
            <button
              onClick={() => setKeywordsExpanded(!keywordsExpanded)}
              className="sm:hidden flex items-center gap-1 text-slate-400 text-sm font-medium mb-1"
            >
              <span>Keywords</span>
              <span>{keywordsExpanded ? "▲" : "▼"}</span>
            </button>
            <div className={`sm:block ${keywordsExpanded ? "block" : "hidden"}`}>
              <DetailRow
                label="Keywords"
                value={keywordsFormat(keywords)}
                valueClassName="line-clamp-2 hover:line-clamp-none transition-all duration-300"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <DetailRow label="Production" value={production_companies?.map((p) => p.name).join(", ") || "N/A"} />
          <DetailRow label={isTV ? "Created By" : "Director"} value={isTV ? (creatorsString || "N/A") : (director ? director.name : "N/A")} />
          <DetailRow label="Main Cast" value={mainCast.length > 0 ? mainCast.map((actor) => actor.name).join(", ") : "N/A"} />
          {!isTV && (
            <>
              <DetailRow label="Budget" value={budget ? moneyFormat(budget) : "N/A"} />
              <DetailRow label="Revenue" value={revenue ? moneyFormat(revenue) : "N/A"} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
