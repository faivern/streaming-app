import { FaStar } from "react-icons/fa";
type CriteriaRatingsProps = {
  ratingActing: number | null | undefined;
  ratingStory: number | null | undefined;
  ratingSoundtrack: number | null | undefined;
  ratingVisuals: number | null | undefined;
};

type RatingItemProps = {
  value: number | null | undefined;
  label: string;
};

function RatingItem({ value, label }: RatingItemProps) {
  if (value === null || value === undefined) return null;

  return (
    <div className="flex items-center gap-1" title={label}>
      <FaStar className="text-accent-primary text-[10px]" />
      <span className="text-sm text-gray-200">{value.toFixed(1)}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

export default function CriteriaRatings({
  ratingActing,
  ratingStory,
  ratingSoundtrack,
  ratingVisuals,
}: CriteriaRatingsProps) {
  const hasAnyRating =
    (ratingActing !== null && ratingActing !== undefined) ||
    (ratingStory !== null && ratingStory !== undefined) ||
    (ratingSoundtrack !== null && ratingSoundtrack !== undefined) ||
    (ratingVisuals !== null && ratingVisuals !== undefined);

  if (!hasAnyRating) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <RatingItem value={ratingActing} label="Acting" />
      <RatingItem value={ratingStory} label="Story" />
      <RatingItem value={ratingSoundtrack} label="Soundtrack" />
      <RatingItem value={ratingVisuals} label="Visuals" />
    </div>
  );
}
