import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import BaseInsightCard from "./BaseInsightCard";
import { formatRating } from "../../../lib/insights/formatters";
import type { RatingComparison } from "../../../types/insights";

type RatingComparisonCardProps = {
  data: RatingComparison;
};

export default function RatingComparisonCard({ data }: RatingComparisonCardProps) {
  const { userAverage, tmdbAverage, difference, itemCount } = data;

  // Determine color and icon based on difference
  let colorClass = "text-subtle";
  let Icon = Minus;

  if (difference > 0.3) {
    colorClass = "text-green-500";
    Icon = TrendingUp;
  } else if (difference < -0.3) {
    colorClass = "text-red-500";
    Icon = TrendingDown;
  }

  return (
    <BaseInsightCard title="Your Taste vs TMDB" span="md:col-span-2">
      <div className="flex items-center justify-around gap-6 py-4">
        <div className="text-center">
          <div className="text-sm text-subtle mb-2">Your Average</div>
          <div className="text-4xl font-bold text-text-h1">
            {formatRating(userAverage)}
          </div>
        </div>

        <div className={`flex items-center justify-center ${colorClass}`}>
          <Icon className="w-8 h-8" />
        </div>

        <div className="text-center">
          <div className="text-sm text-subtle mb-2">TMDB Average</div>
          <div className="text-4xl font-bold text-text-h1">
            {formatRating(tmdbAverage)}
          </div>
        </div>
      </div>

      <div className="text-xs text-subtle text-center mt-2">
        Based on {itemCount} rated titles
      </div>
    </BaseInsightCard>
  );
}
