import { useState, useMemo } from "react";
import CollectionGrid from "./CollectionGrid";
import TitleMid from "../title/TitleMid";
import SortingDropdown from "../../ui/SortingDropdown";
import {
  useSortByBayesian,
  useSortByNewest,
  useSortByOldest,
  useSortAZ,
  useSortZA,
  type SortOption,
} from "../../../hooks/sorting";

type Props = {
  parts: Array<any>;
};

const CollectionPartsSection = ({ parts }: Props) => {
  const [sortOption, setSortOption] = useState<SortOption>("bayesian");

  // Apply all sorting hooks (only one will be used based on selection)
  const bayesianSorted = useSortByBayesian(parts);
  const newestSorted = useSortByNewest(parts);
  const oldestSorted = useSortByOldest(parts);
  const azSorted = useSortAZ(parts);
  const zaSorted = useSortZA(parts);

  // Select the appropriate sorted array based on current option
  const sortedParts = useMemo(() => {
    switch (sortOption) {
      case "bayesian":
        return bayesianSorted;
      case "newest":
        return newestSorted;
      case "oldest":
        return oldestSorted;
      case "a-z":
        return azSorted;
      case "z-a":
        return zaSorted;
      default:
        return parts;
    }
  }, [sortOption, bayesianSorted, newestSorted, oldestSorted, azSorted, zaSorted, parts]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mt-6">
      <div className="flex justify-between items-center">
        <TitleMid>Movies in this collection</TitleMid>
        <SortingDropdown value={sortOption} onChange={setSortOption} />
      </div>

      <CollectionGrid parts={sortedParts || []} />
    </div>
  );
};

export default CollectionPartsSection;
