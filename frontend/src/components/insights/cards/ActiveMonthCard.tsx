import { Calendar } from "lucide-react";
import BaseInsightCard from "./BaseInsightCard";
import type { ActiveMonth } from "../../../types/insights";

type ActiveMonthCardProps = {
  data: ActiveMonth | null;
};

export default function ActiveMonthCard({ data }: ActiveMonthCardProps) {
  return (
    <BaseInsightCard title="Most Active Month" span="md:col-span-2">
      {data ? (
        <div className="flex items-center gap-4 py-4">
          <div className="bg-accent-primary/20 rounded-full p-4">
            <Calendar className="w-8 h-8 text-accent-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-h1 mb-1">
              {data.displayName}
            </div>
            <div className="text-sm text-subtle">
              {data.count} titles added
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-subtle">
          Not enough data yet
        </div>
      )}
    </BaseInsightCard>
  );
}
