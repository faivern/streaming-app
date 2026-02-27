import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faListUl, faShare } from "@fortawesome/free-solid-svg-icons";
import useShare from "../../../hooks/useShare";
import AddToListModal from "../../lists/modals/AddToListModal";

type Props = {
  onWatchNow: () => void;
  mediaId: number;
  mediaType: string;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  overview?: string | null;
  voteAverage?: number | null;
};

export default function MediaPosterActions({
  onWatchNow,
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  overview,
  voteAverage,
}: Props) {
  const handleShare = useShare();
  const [addToListModalOpen, setAddToListModalOpen] = useState(false);

  return (
    <div className="mt-6 grid grid-cols-3 md:grid-cols-2 gap-3">
      <button
        aria-label="Watch Now"
        title="Watch Now"
        onClick={onWatchNow}
        className="bg-gradient-to-b from-accent-primary to-accent-secondary
                   hover:from-accent-primary hover:to-accent-secondary
                   text-white py-4 px-2 rounded-xl font-semibold shadow-lg
                   transform transition-transform duration-200 hover:scale-103
                   flex flex-col items-center justify-center gap-1 cursor-pointer
                   md:col-span-2 md:flex-row md:gap-2"
      >
        <FontAwesomeIcon icon={faPlay} className="text-white text-base" />
        <span className="text-md tracking-wide">Watch</span>
      </button>
      {/*testchange */}
      <button
        aria-label="Add to List"
        title="Add to List"
        onClick={() => setAddToListModalOpen(true)}
        className="bg-action-primary hover:bg-action-hover text-white py-4 px-2 rounded-xl font-medium shadow-md transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center gap-1 border border-slate-600/50 hover:cursor-pointer md:flex-row md:gap-2"
      >
        <FontAwesomeIcon icon={faListUl} className="text-base" />
        <span className="text-md">Add</span>
      </button>

      <button
        onClick={handleShare}
        aria-label="Share"
        title="Share"
        className="bg-action-primary hover:bg-action-hover text-white py-4 px-2 rounded-xl font-medium shadow-md transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center gap-1 border border-accent-foreground hover:cursor-pointer md:flex-row md:gap-2"
      >
        <FontAwesomeIcon icon={faShare} className="text-base" />
        <span className="text-md">Share</span>
      </button>

      <AddToListModal
        isOpen={addToListModalOpen}
        onClose={() => setAddToListModalOpen(false)}
        media={{
          tmdbId: mediaId,
          mediaType,
          title,
          posterPath: posterPath ?? null,
          backdropPath: backdropPath ?? null,
          overview: overview ?? null,
          voteAverage: voteAverage ?? null,
        }}
      />
    </div>
  );
}
