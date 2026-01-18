import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faBookmark, faShare } from "@fortawesome/free-solid-svg-icons";
import useShare from "../../../hooks/useShare";
import useAddWatchList from "../../../hooks/useAddWatchList";

type Props = {
  onWatchNow: () => void;
  mediaId: number;
  mediaType: string;
  title: string;
  posterPath?: string | null;
};

export default function MediaPosterActions({ onWatchNow, mediaId, mediaType, title, posterPath }: Props) {
    const handleShare = useShare();
    const addToWatchList = useAddWatchList();

    const handleAddWatchList = () => {
      addToWatchList({
        tmdbId: mediaId,
        mediaType,
        title,
        posterPath: posterPath ?? undefined,
      });
    };

  return (
    <div className="mt-6 space-y-3">
<button
  onClick={onWatchNow}
  className="w-full bg-gradient-to-r from-accent-primary via-accent-secondary to-accent-thirdary
             hover:from-accent-primary hover:to-accent-secondary
             text-white py-4 px-6 rounded-xl font-semibold shadow-lg 
             transform transition-transform duration-200 hover:scale-103 
             flex items-center justify-center gap-3 cursor-pointer"
>
  <FontAwesomeIcon icon={faPlay} className="text-white text-lg" />
  <span className="tracking-wide">Watch Now</span>
</button>

      <div className="grid grid-cols-2 gap-3">
        <button
            onClick={handleAddWatchList} 
            className="bg-action-primary hover:bg-action-hover text-white py-3 px-4 rounded-xl font-medium shadow-md transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 border border-slate-600/50 hover:cursor-pointer">
          <FontAwesomeIcon icon={faBookmark} />
          <span>Watchlist</span>
        </button>

        <button
            onClick={handleShare} 
            className="bg-action-primary
            hover:bg-action-hover text-white py-3 px-4 rounded-xl font-medium shadow-md transition-all duration-200 
              hover:scale-105 flex items-center justify-center gap-2 border border-accent-foreground 
              hover:cursor-pointer">
          <FontAwesomeIcon icon={faShare} />
          <span>Share</span>
        </button>

      </div>
    </div>
  );
}
