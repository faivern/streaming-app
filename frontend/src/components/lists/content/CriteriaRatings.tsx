import { MdTheaters, MdAutoStories, MdMusicNote, MdVisibility } from "react-icons/md";

type CriteriaRatingsProps = {
  ratingActing: number | null | undefined;
  ratingStory: number | null | undefined;
  ratingSoundtrack: number | null | undefined;
  ratingVisuals: number | null | undefined;
};

type RatingItemProps = {
  icon: React.ReactNode;
  value: number | null | undefined;
  label: string;
};

function RatingItem({ icon, value, label }: RatingItemProps) {
  if (value === null || value === undefined) return null;

  return (
    <div className="flex items-center gap-1" title={label}>
      <span className="text-gray-400">{icon}</span>
      <span className="text-xs text-gray-300">{value.toFixed(1)}</span>
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
    ratingActing !== null &&
    ratingActing !== undefined ||
    ratingStory !== null &&
    ratingStory !== undefined ||
    ratingSoundtrack !== null &&
    ratingSoundtrack !== undefined ||
    ratingVisuals !== null &&
    ratingVisuals !== undefined;

  if (!hasAnyRating) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <RatingItem
        icon={<MdTheaters className="text-base" />}
        value={ratingActing}
        label="Acting"
      />
      <RatingItem
        icon={<MdAutoStories className="text-base" />}
        value={ratingStory}
        label="Story"
      />
      <RatingItem
        icon={<MdMusicNote className="text-base" />}
        value={ratingSoundtrack}
        label="Soundtrack"
      />
      <RatingItem
        icon={<MdVisibility className="text-base" />}
        value={ratingVisuals}
        label="Visuals"
      />
    </div>
  );
}
