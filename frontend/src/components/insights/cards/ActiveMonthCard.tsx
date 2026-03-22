import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
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
            {/* Icon with pulsing glow */}
            <div className="relative flex-shrink-0">
              <motion.div
                className="absolute inset-0 rounded-full bg-accent-primary/20"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.15, 0.35, 0.15],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut",
                }}
              />
              <div className="relative bg-accent-primary/20 rounded-full p-3">
                <Flame className="w-7 h-7 text-accent-primary drop-shadow-[0_0_6px_var(--accent-primary)]" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold leading-tight bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                {data.displayName}
              </div>
              <div className="text-sm text-subtle mt-0.5">
                <CountUp end={data.count} duration={1.5} /> titles added
              </div>
            </div>
          </div>

          {/* Activity dots */}
          <div className="flex items-center gap-1.5 justify-center">
            {Array.from({ length: Math.min(data.count, 12) }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-accent-primary/60"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
              />
            ))}
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
