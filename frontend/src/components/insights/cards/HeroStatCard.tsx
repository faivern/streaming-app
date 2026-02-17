import CountUp from "react-countup";
import { Film } from "lucide-react";
import BaseInsightCard from "./BaseInsightCard";

type HeroStatCardProps = {
  totalCount: number;
};

export default function HeroStatCard({ totalCount }: HeroStatCardProps) {
  return (
    <BaseInsightCard span="md:col-span-2 md:row-span-2">
      <div className="flex flex-col items-center justify-center h-full">
        <Film className="w-10 h-10 text-accent-primary mb-4" />
        <div className="text-6xl md:text-7xl font-extrabold text-text-h1 mb-2">
          <CountUp end={totalCount} duration={2} />
        </div>
        <div className="text-lg text-subtle">Movies & Shows</div>
      </div>
    </BaseInsightCard>
  );
}
