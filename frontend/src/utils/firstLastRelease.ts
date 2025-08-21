import { dateFormatYear } from "./dateFormatYear";
export function firstLastRelease(parts: Array<{ release_date: string }>) {
  let first = Infinity;
  let last = 0;

  for (let i = 0; i < parts.length; i++) {
    const year = dateFormatYear(parts[i].release_date);
    if (year) {
      first = Math.min(first, year);
      last = Math.max(last, year);
    }
  }

  return { first, last };
}