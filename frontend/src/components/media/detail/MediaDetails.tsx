import React from "react";
import { dateFormat } from "../../../utils/dateFormat";
import languageMap from "../../../utils/languageMap";
import { keywordsFormat } from "../../../utils/keywordsFormat";
import { getDirector, getMainCast } from "../../../utils/creditsUtils";
import { moneyFormat } from "../../../utils/moneyFormat";

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
}: Props) {
  const director = getDirector(crew);
  const mainCast = getMainCast(cast);

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
        <div className="space-y-4">
          <div>
            <span className="text-slate-400 text-sm font-medium block">Release Date</span>
            <span className="text-white font-medium">{dateFormat(release_date) || "N/A"}</span>
          </div>

          <div>
            <span className="text-slate-400 text-sm font-medium block">Language</span>
            <span className="text-white font-medium">
              {language ? languageMap[language] || "Unknown" : "Unknown"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-sm font-medium block">Country</span>
            <span className="text-white font-medium">{country || "N/A"}</span>
          </div>

          <div>
            <span className="text-slate-400 text-sm font-medium block">Keywords</span>
            <span className="text-white font-medium line-clamp-2 hover:line-clamp-none transition-all duration-300">{keywordsFormat(keywords)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-slate-400 text-sm font-medium block">Production</span>
            <span className="text-white font-medium">
              {production_companies?.map((p) => p.name).join(", ") || "N/A"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-sm font-medium block">Director</span>
            <span className="text-white font-medium">
              {director ? director.name : "N/A"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-sm font-medium block">Main Cast</span>
            <span className="text-white font-medium">
              {mainCast.length > 0 ? mainCast.map((actor) => actor.name).join(", ") : "N/A"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-sm font-medium block">Budget</span>
            <span className="text-white font-medium">
              {budget ? moneyFormat(budget) : "N/A"}
            </span>
          </div>

                    <div>
            <span className="text-slate-400 text-sm font-medium block">Revenue</span>
            <span className="text-white font-medium">
              {revenue ? moneyFormat(revenue) : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
