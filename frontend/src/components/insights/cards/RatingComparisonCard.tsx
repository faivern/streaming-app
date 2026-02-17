import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import BaseInsightCard from "./BaseInsightCard";
import { formatRating } from "../../../lib/insights/formatters";
import type { RatingComparison } from "../../../types/insights";

type RatingComparisonCardProps = {
  data: RatingComparison;
};

function getVerdict(diff: number): { label: string; sub: string; colorClass: string } {
  if (diff > 1.5) return { label: "Tough crowd", sub: "You hold films to a higher standard", colorClass: "text-red-400" };
  if (diff > 0.3) return { label: "Slightly critical", sub: "A little harder to impress than most", colorClass: "text-orange-400" };
  if (diff > -0.3) return { label: "Right on the money", sub: "Your taste aligns with the crowd", colorClass: "text-green-400" };
  if (diff > -1.5) return { label: "Easy to please", sub: "You see the best in everything", colorClass: "text-blue-400" };
  return { label: "Pure love", sub: "You rate almost everything highly", colorClass: "text-purple-400" };
}

export default function RatingComparisonCard({ data }: RatingComparisonCardProps) {
  const { userAverage, tmdbAverage, difference, itemCount } = data;

  let colorClass = "text-subtle";
  let Icon = Minus;

  if (difference > 0.3) {
    colorClass = "text-green-500";
    Icon = TrendingUp;
  } else if (difference < -0.3) {
    colorClass = "text-red-500";
    Icon = TrendingDown;
  }

  const verdict = getVerdict(difference);

  return (
    <BaseInsightCard title="Your Taste vs TMDB">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-around gap-4 py-2">
          <div className="text-center">
            <div className="text-xs text-subtle mb-1">You</div>
            <div className="text-4xl font-bold text-text-h1">
              {formatRating(userAverage)}
            </div>
          </div>

          <div className={`flex items-center justify-center ${colorClass}`}>
            <Icon className="w-7 h-7" />
          </div>

          <div className="text-center">
            <div className="text-xs text-subtle mb-1">TMDB</div>
            <div className="text-4xl font-bold text-text-h1">
              {formatRating(tmdbAverage)}
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 pt-3 text-center">
          <div className={`text-sm font-semibold ${verdict.colorClass}`}>
            {verdict.label}
          </div>
          <div className="text-xs text-subtle/70 mt-0.5">{verdict.sub}</div>
          <div className="text-xs text-subtle/50 mt-1">Based on {itemCount} rated titles</div>
        </div>
      </div>
    </BaseInsightCard>
  );
}
