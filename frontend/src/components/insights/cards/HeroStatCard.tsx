import CountUp from "react-countup";
import { Film } from "lucide-react";
import BaseInsightCard from "./BaseInsightCard";

type HeroStatCardProps = {
  totalCount: number;
};

export default function HeroStatCard({ totalCount }: HeroStatCardProps) {
  const estimatedHours = Math.round(totalCount * 1.8);

  return (
    <BaseInsightCard>
      <div className="flex flex-col items-center justify-center h-full gap-1">
        <Film className="w-9 h-9 text-accent-primary mb-2" />
        <div className="text-xs font-semibold text-subtle uppercase tracking-widest">
          you've tracked
        </div>
        <div className="text-6xl md:text-7xl font-extrabold text-text-h1 leading-none">
          <CountUp end={totalCount} duration={2} />
        </div>
        <div className="text-base text-subtle">films &amp; series</div>
        <div className="mt-4 pt-3 border-t border-border/30 w-full text-center">
          <span className="text-xs text-subtle/70">
            ~{estimatedHours.toLocaleString()}h of stories in your universe
          </span>
        </div>
      </div>
    </BaseInsightCard>
  );
}
