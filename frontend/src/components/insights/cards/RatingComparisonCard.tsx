import CountUp from "react-countup";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import BaseInsightCard from "./BaseInsightCard";
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

  let Icon = Minus;

  if (difference > 0.3) {
    Icon = TrendingUp;
  } else if (difference < -0.3) {
    Icon = TrendingDown;
  }

  const verdict = getVerdict(difference);

  // Positions on a 0-10 scale for the gauge bar
  const userPos = Math.min(Math.max((userAverage / 10) * 100, 5), 95);
  const tmdbPos = Math.min(Math.max((tmdbAverage / 10) * 100, 5), 95);

  const diffSign = difference > 0 ? "+" : "";
  const diffBadgeColor = difference > 0.3
    ? "bg-green-500/20 text-green-400"
    : difference < -0.3
      ? "bg-red-500/20 text-red-400"
      : "bg-subtle/20 text-subtle";

  return (
    <BaseInsightCard title="Your Taste vs TMDB">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-around gap-4 py-2">
          <div className="text-center">
            <div className="text-xs text-subtle mb-1">You</div>
            <div className="text-4xl font-bold text-text-h1">
              <CountUp end={userAverage} decimals={1} duration={1.5} />
            </div>
          </div>

          {/* Animated difference badge */}
          <motion.div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold ${diffBadgeColor}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 300, damping: 20 }}
          >
            <Icon className="w-4 h-4" />
            <span>{diffSign}{Math.abs(difference).toFixed(1)}</span>
          </motion.div>

          <div className="text-center">
            <div className="text-xs text-subtle mb-1">TMDB</div>
            <div className="text-4xl font-bold text-text-h1">
              <CountUp end={tmdbAverage} decimals={1} duration={1.5} />
            </div>
          </div>
        </div>

        {/* Visual gauge bar */}
        <div className="relative h-2 bg-component-secondary rounded-full overflow-visible mx-2">
          {/* User marker */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-primary shadow-[0_0_6px_var(--accent-primary)] z-[2]"
            initial={{ left: "50%" }}
            animate={{ left: `${userPos}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ marginLeft: "-6px" }}
          />
          {/* TMDB marker */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-subtle/80 border border-border z-[1]"
            initial={{ left: "50%" }}
            animate={{ left: `${tmdbPos}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ marginLeft: "-6px" }}
          />
        </div>

        <div className="border-t border-border/30 pt-3 text-center">
          <div className={`text-lg font-bold ${verdict.colorClass}`}>
            {verdict.label}
          </div>
          <div className="text-xs text-subtle/70 mt-0.5">{verdict.sub}</div>
          <div className="text-xs text-subtle/50 mt-1">Based on {itemCount} rated titles</div>
        </div>
      </div>
    </BaseInsightCard>
  );
}
