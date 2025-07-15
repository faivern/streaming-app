import React from "react";
import { dateFormat } from "../../utils/dateFormat";
import languageMap from "../../utils/languageMap";

type ProductionCompany = {
  id: number;
  name: string;
};

type Props = {
  release_date: string;
  country?: string;
  language?: string;
  production_companies?: ProductionCompany[];
};

export default function MediaDetails({
  release_date,
  country,
  language,
  production_companies,
}: Props) {
  return (
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30">
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
            <span className="text-white font-medium">Coming Soon</span>
          </div>

          <div>
            <span className="text-slate-400 text-sm font-medium block">Cast</span>
            <span className="text-white font-medium">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
