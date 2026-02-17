import { TrendingUp, Plus } from "lucide-react";

type InsightsEmptyStateProps = {
  onBrowse: () => void;
};

export default function InsightsEmptyState({ onBrowse }: InsightsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="bg-accent-primary/20 rounded-full p-6 mb-6">
        <TrendingUp className="w-12 h-12 text-accent-primary" />
      </div>

      <h2 className="text-2xl font-bold text-text-h1 mb-3">
        Your insights are waiting
      </h2>

      <p className="text-text-subtle max-w-md mb-8">
        Add at least 3 movies or TV shows to unlock personalized insights about your watching
        habits, favorite genres, and more.
      </p>

      <button
        onClick={onBrowse}
        className="bg-accent-primary hover:bg-accent-primary/90 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Browse & Add Media
      </button>
    </div>
  );
}
