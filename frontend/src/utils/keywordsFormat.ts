export function keywordsFormat(keywords: string[]): string {
  if (!keywords || keywords.length === 0) return "No keywords available";

  // Join keywords with commas and ensure proper formatting
  return keywords.map(kw => kw.trim()).filter(Boolean).join(", ");
}