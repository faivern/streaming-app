export interface AiDiscoverRequest {
  query: string;
}

export interface AiDiscoverResult {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  explanation: string;
  matchScore: number;
}

export interface AiDiscoverResponse {
  results: AiDiscoverResult[];
  alternates: AiDiscoverResult[];
  message: string;
  responseTimeMs: number;
}
