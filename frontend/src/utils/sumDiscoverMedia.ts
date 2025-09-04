interface DiscoverResponse {
  total_results: number;
}

export function sumDiscoverMedia(...responses: (DiscoverResponse | undefined | null)[]): number {
  return responses.reduce((sum, res) => sum + (res?.total_results ?? 0), 0);
}