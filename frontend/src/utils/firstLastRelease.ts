import { dateFormatYear } from "./dateFormatYear";
export function firstLastRelease(
  parts?: Array<{ release_date?: string }>

): { first: number | null; last: number | null } {
  if (!parts || parts.length === 0) return { first: null, last: null };

  let first = Infinity;
  let last = -Infinity;

  for (let i = 0; i < parts?.length; i++) {
    const year = dateFormatYear(parts[i].release_date);
    if (year) {
      first = Math.min(first, year);
      last = Math.max(last, year);
    }
  }

  return { first, last };
}