import { useState, useRef, useCallback } from "react";
import { Clapperboard, Loader2 } from "lucide-react";

type AiSearchInputProps = {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: () => void;
  isPending: boolean;
};

const MAX_ROWS_HEIGHT = 144; // ~5 rows

export default function AiSearchInput({
  query,
  onQueryChange,
  onSubmit,
  isPending,
}: AiSearchInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isClapping, setIsClapping] = useState(false);
  const charsRemaining = 250 - query.length;
  const isDisabled = isPending || query.trim().length === 0;
  const textBoxPlaceholder = "A movie where a guy relives the same day over and over again...";

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_ROWS_HEIGHT)}px`;
  }, []);

  const handleSubmit = () => {
    if (isDisabled) return;
    setIsClapping(true);
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isPending && query.trim().length > 0) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative z-[1] pb-safe">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <textarea
            ref={textareaRef}
            rows={2}
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              autoGrow();
            }}
            onKeyDown={handleKeyDown}
            maxLength={250}
            placeholder={textBoxPlaceholder}
            disabled={isPending}
            className={`flex-1 bg-white/[0.08] border border-white/[0.12] backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.2)] text-white text-base placeholder:text-[var(--subtle)] rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow duration-150 resize-none ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`w-12 h-12 rounded-full flex items-center justify-center bg-[var(--accent-primary)] text-white transition-all duration-200 shrink-0 ${
              isDisabled
                ? "opacity-40 cursor-not-allowed"
                : "shadow-[0_0_12px_2px] shadow-[var(--accent-primary)]/25"
            }`}
          >
            {isPending && !isClapping ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Clapperboard
                size={20}
                className={isClapping ? "animate-[clap_0.3s_ease-out]" : ""}
                onAnimationEnd={() => setIsClapping(false)}
              />
            )}
          </button>
        </div>
        {charsRemaining < 100 && (
          <p className="text-sm text-[var(--subtle)] mt-1">
            {charsRemaining} characters left
          </p>
        )}
      </div>
    </div>
  );
}
