import AiSwipeStack from "./AiSwipeStack";
import type { AiDiscoverResult } from "../../types/aiDiscover";

type AiResultsGridProps = {
  results: AiDiscoverResult[];
  messageId: string;
};

export default function AiResultsGrid({ results, messageId }: AiResultsGridProps) {
  return <AiSwipeStack results={results} messageId={messageId} />;
}
