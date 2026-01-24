import { useState } from "react";
import CollectionGrid from "./CollectionGrid";
import TitleMid from "../title/TitleMid";
import SortingDropdown from "../../ui/SortingDropdown";
import { useSortedMedia, type SortOption } from "../../../hooks/sorting";

type Props = {
  parts: Array<any>;
};

const CollectionPartsSection = ({ parts }: Props) => {
  const [sortOption, setSortOption] = useState<SortOption>("oldest");
  const sortedParts = useSortedMedia(parts, sortOption);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-6">
      <div className="flex justify-between items-center">
        <TitleMid>Movies in this collection</TitleMid>
        <SortingDropdown value={sortOption} onChange={setSortOption} className="pb-3" />
      </div>

      <CollectionGrid parts={sortedParts} />
    </div>
  );
};

export default CollectionPartsSection;
