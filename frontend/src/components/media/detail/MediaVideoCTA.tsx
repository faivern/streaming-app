import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl } from "@fortawesome/free-solid-svg-icons";
import { FaTv } from "react-icons/fa";

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
      className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-12 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onScrollToWatchProviders}
          aria-label="Scroll to where to watch section"
          className="bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-thirdary
                     hover:from-accent-primary hover:to-accent-secondary
                     text-white py-2.5 px-5 rounded-xl font-semibold shadow-lg
                     transform transition-transform duration-200 hover:scale-105
                     flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <FaTv className="text-sm" />
          <span>Where to Watch</span>
        </button>

        <button
          type="button"
          onClick={onAddToList}
          aria-label="Add this media to a list"
          className="bg-action-primary hover:bg-action-hover text-white py-2.5 px-5 rounded-xl
                     font-medium shadow-md transition-all duration-200 hover:scale-105
                     flex items-center justify-center gap-2 border border-accent-foreground cursor-pointer text-sm"
        >
          <FontAwesomeIcon icon={faListUl} />
          <span>Add to List</span>
        </button>
      </div>
    </div>
  );
}
