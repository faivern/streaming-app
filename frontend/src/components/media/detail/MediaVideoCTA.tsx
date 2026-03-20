import { Plus } from "lucide-react";

type Props = {
  visible: boolean;
  onScrollToWatchProviders: () => void;
  onAddToList: () => void;
  onPauseVideo?: () => void;
};

export default function MediaVideoCTA({
  visible,
  onScrollToWatchProviders,
  onAddToList,
  onPauseVideo,
}: Props) {
  return (
    <div
      className={`absolute bottom-6 md:bottom-14 left-1/2 -translate-x-1/2 z-30 px-2 py-1.5 md:px-4 md:py-3 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-row items-center justify-center gap-1.5 md:gap-3 bg-black/40 backdrop-blur-sm rounded-lg shadow-lg py-2 px-3 md:py-4 md:px-8">
        <button
          type="button"
          onClick={() => {
            onPauseVideo?.();
            onScrollToWatchProviders();
          }}
          aria-label="Scroll to where to watch section"
          className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-thirdary hover:bg-action-hover text-white rounded-xl font-medium shadow-md transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 border border-slate-600/50 hover:cursor-pointer"
        >
          Where to Watch
        </button>



        <button
          type="button"
          onClick={() => {
            onPauseVideo?.();
            onAddToList();
          }}
          aria-label="Add this media to a list"
          className="p-2 md:p-3 bg-action-primary hover:bg-action-hover text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105 flex items-center justify-center border border-slate-600/50 hover:cursor-pointer"
        >
          <Plus className="size-4 md:size-5" />
        </button>
      </div>
    </div>
  );
}
