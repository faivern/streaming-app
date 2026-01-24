import type { ReactNode } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

interface InfiniteScrollWrapperProps {
  dataLength: number;
  hasMore: boolean;
  next: () => void;
  children: ReactNode;
  loader?: ReactNode;
  endMessage?: ReactNode;
  scrollThreshold?: number | string;
}

const DefaultLoader = () => (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
  </div>
);

const DefaultEndMessage = () => (
  <p className="text-center text-gray-400 py-8">You've seen it all!</p>
);

export default function InfiniteScrollWrapper({
  dataLength,
  hasMore,
  next,
  children,
  loader,
  endMessage,
  scrollThreshold = 0.9,
}: InfiniteScrollWrapperProps) {
  return (
    <InfiniteScroll
      dataLength={dataLength}
      next={next}
      hasMore={hasMore}
      loader={loader ?? <DefaultLoader />}
      endMessage={endMessage ?? <DefaultEndMessage />}
      scrollThreshold={scrollThreshold}
    >
      {children}
    </InfiniteScroll>
  );
}
