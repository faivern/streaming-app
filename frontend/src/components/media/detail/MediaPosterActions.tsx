import { use, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faBookmark, faShare } from "@fortawesome/free-solid-svg-icons";
import useShare from "../../../hooks/useShare";
import useAddWatchList from "../../../hooks/useAddWatchList";

type Props = {
  onWatchNow: () => void;
};

export default function MediaPosterActions({ onWatchNow }: Props) {
    const handleShare = useShare();
    const handleAddWatchList = useAddWatchList();

  return (
    <div className="mt-6 space-y-3">
      <button 
        onClick={onWatchNow}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-3 hover:cursor-pointer">
        
        <FontAwesomeIcon icon={faPlay} className="text-lg" />
        <span>Watch Now</span>
      </button>
      <div className="grid grid-cols-2 gap-3">
        <button
            onClick={handleAddWatchList} 
            className="bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 text-white py-3 px-4 rounded-xl font-medium shadow-md transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 border border-slate-600/50 hover:cursor-pointer">
          <FontAwesomeIcon icon={faBookmark} />
          <span>Watchlist</span>
        </button>

        <button
            onClick={handleShare} 
            className="bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700/80 text-white py-3 px-4 rounded-xl font-medium shadow-md transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 border border-slate-600/50 hover:cursor-pointer">
          <FontAwesomeIcon icon={faShare} />
          <span>Share</span>
        </button>

      </div>
    </div>
  );
}
