import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_PHRASES = [
  "Finding cinematic gems...",
  "Scanning blockbusters...",
  "Digging up cult classics...",
  "Curating award winners...",
  "Unearthing hidden gems...",
  "Browsing timeless picks...",
  "Hunting down binge-worthy hits...",
  "Exploring underrated favorites...",
  "Scouring iconic films...",
  "Rounding up crowd-pleasers...",
] as const;

export default function AiTypingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % LOADING_PHRASES.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-3 px-1 py-2">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-[var(--accent-primary)]"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.span
          key={phraseIndex}
          className="text-sm text-[var(--subtle)]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          {LOADING_PHRASES[phraseIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
