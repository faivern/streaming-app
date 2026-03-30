import { useRef, useCallback } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

type AiSearchInputProps = {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: () => void;
  isPending: boolean;
};

const MAX_ROWS_HEIGHT = 96; // ~3 rows at default line-height

export default function AiSearchInput({
  query,
  onQueryChange,
  onSubmit,
  isPending,
}: AiSearchInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charsRemaining = 500 - query.length;
  const isDisabled = isPending || query.trim().length === 0;

  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_ROWS_HEIGHT)}px`;
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isPending && query.trim().length > 0) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 z-[var(--z-sticky)] bg-[var(--background)]/80 backdrop-blur-xl border-t border-[var(--border)]/30 pb-bottom-nav md:pb-0 pb-safe">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              autoGrow();
            }}
            onKeyDown={handleKeyDown}
            maxLength={500}
            placeholder="A movie where a guy relives the same day..."
            disabled={isPending}
            className={`flex-1 bg-[var(--input)]/80 backdrop-blur-sm text-white placeholder:text-[var(--subtle)] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow duration-150 resize-none ${
              isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={isDisabled}
            className={`w-10 h-10 rounded-full flex items-center justify-center bg-[var(--accent-primary)] text-white transition-all duration-200 ${
              isDisabled
                ? "opacity-40 cursor-not-allowed"
                : "shadow-[0_0_12px_2px] shadow-[var(--accent-primary)]/25"
            }`}
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <ArrowUp size={18} />
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
