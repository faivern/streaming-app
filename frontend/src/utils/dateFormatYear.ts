export function dateFormatYear(release_date?: string | null): number | null {
  if (!release_date) return null;
  const year = release_date.substring(0, 4);
  if (isNaN(Number(year))) return null;
  return Number(year);
}
