const QUICK_PROMPTS = [
  "A mind-bending thriller like Inception",
  "Cozy feel-good movie for a rainy day",
  "Something with a twist ending",
  "A movie where the villain wins",
  "Dark comedy about ordinary people",
];

type AiQuickPromptsProps = {
  onSelect: (prompt: string) => void;
  visible: boolean;
};

export default function AiQuickPrompts({ onSelect, visible }: AiQuickPromptsProps) {
  if (!visible) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onSelect(prompt)}
          className="border border-[var(--outline)] bg-[var(--action-primary)] hover:border-[var(--accent-primary)]/75 hover:bg-[var(--action-hover)] text-white text-sm font-semibold rounded-full px-4 py-2 min-h-11 transition-colors duration-200"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
