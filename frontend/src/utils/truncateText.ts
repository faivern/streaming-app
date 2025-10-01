const STARTING_LENGTH = 0;
const MAX_LENGTH = 38;
const TRUNCATE_LENGTH = 35;

export function truncateText(text?: string): string {
  if (text && text.length > MAX_LENGTH) {
    return text.substring(STARTING_LENGTH, TRUNCATE_LENGTH) + "...";
  }
  return text ?? "";
}
