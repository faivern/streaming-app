type AiSearchInputProps = {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: () => void;
  isPending: boolean;
};

export default function AiSearchInput({
  query,
  onQueryChange,
  onSubmit,
  isPending,
}: AiSearchInputProps) {
  const charsRemaining = 500 - query.length;
  const isDisabled = isPending || query.trim().length === 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isPending && query.trim().length > 0) {
      onSubmit();
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={500}
          placeholder="A movie where a guy relives the same day..."
          disabled={isPending}
          className={`flex-1 bg-[var(--input)] text-white placeholder:text-[var(--subtle)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-shadow duration-150 ${
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
          {isPending ? "Searching..." : "Search for movies"}
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
