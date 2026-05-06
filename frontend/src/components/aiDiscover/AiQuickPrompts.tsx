import { useState, useRef, useCallback } from "react";

const ALL_PROMPTS = [
  "A mind-bending thriller like Inception",
  "Cozy feel-good movie for a rainy day",
  "Something with a twist ending",
  "A movie where the villain wins",
  "Dark comedy about ordinary people",
  "An underrated sci-fi gem from the 2000s",
  "A foreign film that needs no subtitles to feel",
  "Something based on a true story",
  "A heist movie with a clever plan",
  "A coming-of-age film that hits hard",
  "A slow-burn mystery with a big payoff",
  "Something visually stunning to watch on a big screen",
  "A movie that will make me ugly cry",
  "An animated film that's not just for kids",
  "A psychological horror with zero jump scares",
  "A road trip movie with great chemistry",
  "Something set in space but grounded in emotion",
  "A movie with an unreliable narrator",
  "A feel-good sports underdog story",
  "A thriller where you can't trust anyone",
];

const DISPLAY_COUNT = 5;

function shuffleSlice<T>(arr: readonly T[], count: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

type AiQuickPromptsProps = {
  onSelect: (prompt: string) => void;
  visible: boolean;
};

export default function AiQuickPrompts({ onSelect, visible }: AiQuickPromptsProps) {
  const [prompts] = useState(() => shuffleSlice(ALL_PROMPTS, DISPLAY_COUNT));
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolledLeft, setScrolledLeft] = useState(false);
  const [scrolledRight, setScrolledRight] = useState(true);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setScrolledLeft(el.scrollLeft > 4);
    setScrolledRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative w-full min-w-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-2 pb-2 overflow-x-auto scrollbar-none md:flex-wrap md:justify-center md:overflow-visible md:pb-0"
      >
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            className="shrink-0 border border-[var(--outline)] bg-[var(--action-primary)] hover:border-[var(--accent-primary)]/75 hover:bg-[var(--action-hover)] text-white text-sm font-semibold rounded-full px-4 py-2 min-h-11 transition-colors duration-200"
          >
            {prompt}
          </button>
        ))}
      </div>
      {/* Left fade — appears after user starts scrolling */}
      <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none md:hidden transition-opacity duration-200 ${scrolledLeft ? "opacity-100" : "opacity-0"}`} />
      {/* Right fade */}
      <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none md:hidden transition-opacity duration-200 ${scrolledRight ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}
