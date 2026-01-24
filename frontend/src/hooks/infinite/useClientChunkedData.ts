import { useState, useMemo, useCallback } from "react";

export function useClientChunkedData<T>(items: T[], chunkSize: number = 20) {
  const [visibleCount, setVisibleCount] = useState(chunkSize);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + chunkSize, items.length));
  }, [chunkSize, items.length]);

  const reset = useCallback(() => {
    setVisibleCount(chunkSize);
  }, [chunkSize]);

  return { visibleItems, hasMore, loadMore, reset };
}
