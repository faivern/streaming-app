import { useRef, useCallback } from "react";

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
    <div className="w-full">
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
          className={`flex-1 bg-[var(--input)] text-white placeholder:text-[var(--subtle)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow duration-150 resize-none ${
            isPending ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={isDisabled}
          className={`bg-[var(--action-primary)] hover:bg-[var(--action-hover)] text-white font-semibold text-sm rounded-xl px-4 py-3 min-h-11 transition-colors duration-200 whitespace-nowrap ${
            isDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isPending ? "Searching..." : "Search"}
        </button>
      </div>
      {charsRemaining < 100 && (
        <p className="text-sm text-[var(--subtle)] mt-1">
          {charsRemaining} characters left
        </p>
      )}
    </div>
  );
}
