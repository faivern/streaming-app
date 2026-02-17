/**
 * Semantic genre → color map.
 * Colors are chosen to evoke the mood of each genre, not just the app palette.
 */
export const GENRE_COLORS: Record<string, string> = {
  Action: "#FF5722",
  Adventure: "#FF9800",
  Animation: "#00BCD4",
  Comedy: "#FFC107",
  Crime: "#E53935",
  Documentary: "#66BB6A",
  Drama: "#AB47BC",
  Family: "#FF80AB",
  Fantasy: "#7E57C2",
  History: "#A1887F",
  Horror: "#B71C1C",
  Music: "#EC407A",
  Mystery: "#5C6BC0",
  Romance: "#F06292",
  "Science Fiction": "#29B6F6",
  "Sci-Fi & Fantasy": "#29B6F6",
  "TV Movie": "#42A5F5",
  Thriller: "#546E7A",
  War: "#8D6E63",
  Western: "#FF7043",
  "Action & Adventure": "#FF6D00",
  Kids: "#FFCC02",
  News: "#607D8B",
  Reality: "#EF5350",
  Soap: "#EC407A",
  Talk: "#26A69A",
  "War & Politics": "#78909C",
};

const FALLBACK_COLORS = [
  "#26C6DA", "#AB47BC", "#66BB6A", "#FFA726",
  "#EF5350", "#42A5F5", "#EC407A", "#8D6E63",
];

export function getGenreColor(name: string, fallbackIndex = 0): string {
  return GENRE_COLORS[name] ?? FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
}
