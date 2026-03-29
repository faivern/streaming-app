const CHIP_CLASS =
  "border border-[var(--outline)] bg-[var(--action-primary)] hover:border-[var(--accent-primary)]/75 hover:bg-[var(--action-hover)] text-white text-sm font-semibold rounded-full px-4 py-2 min-h-11 transition-colors duration-200";

type AiQuickActionsProps = {
  onRefine: (action: string) => void;
  currentQuery: string;
  resultTitles: string[];
};

export default function AiQuickActions({
  onRefine,
  currentQuery,
  resultTitles,
}: AiQuickActionsProps) {
  const handleMoreLikeThese = () => {
    const titles = resultTitles.slice(0, 3).join(", ");
    onRefine(`More movies like ${titles}`);
  };

  const handleTvShows = () => {
    onRefine(`${currentQuery} (TV shows only)`);
  };

  const handleDarker = () => {
    onRefine(`Something darker: ${currentQuery}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={handleMoreLikeThese} className={CHIP_CLASS}>
        More like these
      </button>
      <button type="button" onClick={handleTvShows} className={CHIP_CLASS}>
        TV shows instead
      </button>
      <button type="button" onClick={handleDarker} className={CHIP_CLASS}>
        Something darker
      </button>
    </div>
  );
}
