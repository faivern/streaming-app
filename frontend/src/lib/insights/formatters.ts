/**
 * Format a number with thousands separators
 * @example formatCount(1234) => "1,234"
 */
export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/**
 * Format a number as a percentage
 * @example formatPercentage(45.6, 0) => "46%"
 * @example formatPercentage(45.6, 1) => "45.6%"
 */
export function formatPercentage(n: number, decimals: number = 0): string {
  return `${n.toFixed(decimals)}%`;
}

/**
 * Format a rating to one decimal place
 * @example formatRating(7.345) => "7.3"
 */
export function formatRating(n: number): string {
  return n.toFixed(1);
}

/**
 * Format a year as a decade string
 * @example formatDecade(2023) => "2020s"
 */
export function formatDecade(year: number): string {
  const decadeStart = Math.floor(year / 10) * 10;
  return `${decadeStart}s`;
}
