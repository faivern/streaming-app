export function countMovies(parts?: Array<{ id?: number }>) {
  return parts?.length || 0;
}