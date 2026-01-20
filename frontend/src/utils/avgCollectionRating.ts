export function avgCollectionRating(
  parts?: Array<{ vote_average?: number }>
): string | null {
  if (!parts?.length) return null;

  let sum = 0;
  let count = 0;

  for (const { vote_average } of parts) {
    if (typeof vote_average === "number" && vote_average > 0) {
      sum += vote_average;
      count++;
    }
  }

  if (count === 0) return null;

  const collectionAvg = sum / count;
  return collectionAvg.toFixed(1); // string, e.g. "7.5"
}
