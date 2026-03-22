import { Crown } from "lucide-react";
import { motion } from "framer-motion";
import type { TopRatedTitle } from "../../../types/insights";
import type { MediaType } from "../../../types/tmdb";
import MediaCard from "../../media/cards/MediaCard";

type Props = {
  topThree: TopRatedTitle[];
};

export default function IdentityIntroCard({ topThree }: Props) {
  if (topThree.length < 3) return null;

  return (
    <div
      className="rounded-2xl p-[1px] shadow-xl mb-8"
      style={{ background: "var(--gradient)" }}
    >
      <div className="bg-component-primary/90 backdrop-blur-md rounded-2xl p-8">
        <p className="text-xs uppercase tracking-widest text-subtle mb-5 bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent font-semibold">
          Your Top 3 Titles
        </p>
        <div className="grid grid-cols-3 gap-2">
          {topThree.map((item, index) => (
            <motion.div
              key={item.tmdbId}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.15, duration: 0.5, ease: "easeOut" }}
            >
              {index === 0 && (
                <motion.div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Crown className="w-7 h-7 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
                </motion.div>
              )}
              <MediaCard
                id={item.tmdbId}
                media_type={item.mediaType as MediaType}
                title={item.title}
                posterPath={item.posterPath ?? ""}
                showQuickAdd={false}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
