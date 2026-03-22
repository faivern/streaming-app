import CountUp from "react-countup";
import { Film } from "lucide-react";
import { motion } from "framer-motion";
import BaseInsightCard from "./BaseInsightCard";

type HeroStatCardProps = {
  totalCount: number;
};

const RING_RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function HeroStatCard({ totalCount }: HeroStatCardProps) {
  const estimatedHours = Math.round(totalCount * 1.8);

  return (
    <BaseInsightCard>
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent-primary)_0%,_transparent_70%)] opacity-[0.08] pointer-events-none" />

      <div className="flex flex-col items-center justify-center h-full gap-1 relative">
        {/* Pulsing glow behind icon */}
        <div className="relative mb-2">
          <motion.div
            className="absolute inset-0 rounded-full bg-accent-primary/20"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          />
          <Film className="relative w-10 h-10 text-accent-primary drop-shadow-[0_0_8px_var(--accent-primary)]" />
        </div>

        <div className="text-xs font-semibold text-subtle uppercase tracking-widest">
          you've tracked
        </div>

        {/* Animated SVG ring + count */}
        <div className="relative flex items-center justify-center my-1">
          <svg
            width="130"
            height="130"
            viewBox="0 0 130 130"
            className="absolute"
          >
            {/* Background ring */}
            <circle
              cx="65"
              cy="65"
              r={RING_RADIUS}
              fill="none"
              stroke="var(--border)"
              strokeWidth="3"
              opacity="0.3"
            />
            {/* Animated accent ring */}
            <motion.circle
              cx="65"
              cy="65"
              r={RING_RADIUS}
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: CIRCUMFERENCE * 0.25 }}
              transition={{ duration: 2, ease: "easeOut" }}
              transform="rotate(-90 65 65)"
              opacity="0.6"
            />
          </svg>
          <div className="text-6xl md:text-7xl font-extrabold leading-none bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-thirdary bg-clip-text text-transparent">
            <CountUp end={totalCount} duration={2} />
          </div>
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
