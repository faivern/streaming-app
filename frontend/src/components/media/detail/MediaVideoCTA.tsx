import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl } from "@fortawesome/free-solid-svg-icons";

type Props = {
  visible: boolean;
  onScrollToWatchProviders: () => void;
  onAddToList: () => void;
};

export default function MediaVideoCTA({
  visible,
  onScrollToWatchProviders,
  onAddToList,
}: Props) {
  return (
    <div
      className={`absolute bottom-14 left-1/2 -translate-x-1/2 z-30 px-4 py-3 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-black/40 backdrop-blur-sm rounded-lg shadow-lg py-4 px-8">
        <button
          type="button"
          onClick={onScrollToWatchProviders}
          aria-label="Scroll to where to watch section"
          className="px-4 py-2 bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-thirdary hover:bg-action-hover text-white rounded-xl font-medium shadow-md transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 border border-slate-600/50 hover:cursor-pointer"
        >
          Where to Watch
        </button>

        <button
          type="button"
          onClick={onAddToList}
          aria-label="Add this media to a list"
          className="px-4 py-2 bg-action-primary hover:bg-action-hover text-white rounded-xl font-medium shadow-md transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 border border-slate-600/50 hover:cursor-pointer"
        >
          <FontAwesomeIcon icon={faListUl} />
          <span>Add to List</span>
        </button>
      </div>
    </div>
  );
}
