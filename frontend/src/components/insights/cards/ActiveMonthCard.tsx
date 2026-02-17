import { Calendar } from "lucide-react";
import BaseInsightCard from "./BaseInsightCard";
import type { ActiveMonth } from "../../../types/insights";

type ActiveMonthCardProps = {
  data: ActiveMonth | null;
};

export default function ActiveMonthCard({ data }: ActiveMonthCardProps) {
  return (
    <BaseInsightCard title="Most Active Month">
      {data ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 py-2">
            <div className="bg-accent-primary/20 rounded-full p-3 flex-shrink-0">
              <Calendar className="w-7 h-7 text-accent-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-text-h1 leading-tight">
                {data.displayName}
              </div>
              <div className="text-sm text-subtle mt-0.5">
                {data.count} titles added
              </div>
            </div>
          </div>
          <div className="border-t border-border/30 pt-2">
            <p className="text-xs text-subtle/70 text-center">
              Your most prolific watching streak
            </p>
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
