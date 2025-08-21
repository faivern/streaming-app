export function avgCollectionRating(parts: Array<{ vote_average: number }>) {
  let sum = 0;
  let count = 0;

  for (const { vote_average } of parts) {
    if (vote_average) {
      sum += vote_average;
      count++;
    }
  }

  let collectionAvg = sum / count;
  return collectionAvg.toFixed(1);
}
