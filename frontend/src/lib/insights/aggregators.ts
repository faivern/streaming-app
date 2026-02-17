import type {
  EnrichedListItem,
  GenreDistribution,
  TopPerson,
  RatingComparison,
  ActiveMonth,
  ReleaseYearBreakdown,
  MediaEntry,
} from "../../types/insights";

/**
 * Compute genre distribution from list items with details
 */
export function computeGenreDistribution(
  items: EnrichedListItem[]
): GenreDistribution[] {
  const genreCounts = new Map<string, number>();
  let totalGenres = 0;

  // Count genres
  items.forEach((item) => {
    const genres = item.details?.genres;
    if (genres && Array.isArray(genres)) {
      genres.forEach((genre) => {
        if (genre.name) {
          genreCounts.set(genre.name, (genreCounts.get(genre.name) || 0) + 1);
          totalGenres++;
        }
      });
    }
  });

  // Convert to distribution array with percentages
  const distribution: GenreDistribution[] = [];
  genreCounts.forEach((value, name) => {
    distribution.push({
      name,
      value,
      percentage: totalGenres > 0 ? (value / totalGenres) * 100 : 0,
    });
  });

  // Sort by count descending
  return distribution.sort((a, b) => b.value - a.value);
}

/**
 * Get top N genres from distribution
 */
export function getTopGenres(
  distribution: GenreDistribution[],
  limit: number = 5
): GenreDistribution[] {
  return distribution.slice(0, limit);
}

/**
 * Compute top actors from list items with credits
 * Only considers top 5 cast members per media to avoid extras
 */
export function computeTopActors(
  items: EnrichedListItem[],
  limit: number = 5
): TopPerson[] {
  const actorMap = new Map<
    number,
    { name: string; profilePath: string | null; count: number; roles: Array<{ title: string; character?: string }> }
  >();

  items.forEach((item) => {
    const cast = item.credits?.cast;
    if (!cast || !Array.isArray(cast)) return;

    // Only top 5 cast members to avoid extras
    const topCast = cast
      .filter((c) => c.id && c.name)
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .slice(0, 5);

    topCast.forEach((actor) => {
      if (!actor.id || !actor.name) return;

      const existing = actorMap.get(actor.id);
      const title = item.details?.title || item.details?.name || item.title || "Unknown";

      if (existing) {
        existing.count++;
        existing.roles.push({
          title,
          character: actor.character,
        });
      } else {
        actorMap.set(actor.id, {
          name: actor.name,
          profilePath: actor.profile_path ?? null,
          count: 1,
          roles: [
            {
              title,
              character: actor.character,
            },
          ],
        });
      }
    });
  });

  // Convert to array and sort by count
  const actors: TopPerson[] = Array.from(actorMap.entries()).map(
    ([id, data]) => ({
      id,
      ...data,
    })
  );

  return actors.sort((a, b) => b.count - a.count).slice(0, limit);
}

/**
 * Compute top directors from list items with credits
 */
export function computeTopDirectors(
  items: EnrichedListItem[],
  limit: number = 5
): TopPerson[] {
  const directorMap = new Map<
    number,
    { name: string; profilePath: string | null; count: number; roles: Array<{ title: string; job?: string }> }
  >();

  items.forEach((item) => {
    const crew = item.credits?.crew;
    if (!crew || !Array.isArray(crew)) return;

    // Filter for directors
    const directors = crew.filter(
      (c) => c.id && c.name && c.job === "Director"
    );

    directors.forEach((director) => {
      if (!director.id || !director.name) return;

      const existing = directorMap.get(director.id);
      const title = item.details?.title || item.details?.name || item.title || "Unknown";

      if (existing) {
        existing.count++;
        existing.roles.push({
          title,
          job: director.job,
        });
      } else {
        directorMap.set(director.id, {
          name: director.name,
          profilePath: director.profile_path ?? null,
          count: 1,
          roles: [
            {
              title,
              job: director.job,
            },
          ],
        });
      }
    });
  });

  // Convert to array and sort by count
  const directors: TopPerson[] = Array.from(directorMap.entries()).map(
    ([id, data]) => ({
      id,
      ...data,
    })
  );

  return directors.sort((a, b) => b.count - a.count).slice(0, limit);
}

/**
 * Compute rating comparison between user ratings and TMDB ratings
 * User rating is average of acting, story, visuals, soundtrack
 * Items without MediaEntry use TMDB rating for both
 */
export function computeRatingComparison(
  items: EnrichedListItem[],
  mediaEntries: MediaEntry[]
): RatingComparison {
  // Create map for quick lookup
  const entryMap = new Map<string, MediaEntry>();
  mediaEntries.forEach((entry) => {
    const key = `${entry.tmdbId}-${entry.mediaType}`;
    entryMap.set(key, entry);
  });

  let userRatingSum = 0;
  let tmdbRatingSum = 0;
  let count = 0;

  items.forEach((item) => {
    const tmdbRating = item.details?.vote_average;
    if (!tmdbRating) return;

    const key = `${item.tmdbId}-${item.mediaType}`;
    const entry = entryMap.get(key);

    if (entry) {
      // Calculate user rating from available components
      const ratings = [
        entry.ratingActing,
        entry.ratingStory,
        entry.ratingVisuals,
        entry.ratingSoundtrack,
      ].filter((r): r is number => r !== null);

      if (ratings.length > 0) {
        const userRating =
          ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        userRatingSum += userRating;
        tmdbRatingSum += tmdbRating;
        count++;
      }
    } else {
      // No user rating, use TMDB for both
      userRatingSum += tmdbRating;
      tmdbRatingSum += tmdbRating;
      count++;
    }
  });

  const userAverage = count > 0 ? userRatingSum / count : 0;
  const tmdbAverage = count > 0 ? tmdbRatingSum / count : 0;

  return {
    userAverage,
    tmdbAverage,
    difference: userAverage - tmdbAverage,
    itemCount: count,
  };
}

/**
 * Find the most active month based on when items were added to the list
 */
export function computeMostActiveMonth(
  items: EnrichedListItem[]
): ActiveMonth | null {
  if (items.length === 0) return null;

  const monthCounts = new Map<string, { year: number; count: number }>();

  items.forEach((item) => {
    if (!item.addedAt) return;

    try {
      const date = new Date(item.addedAt);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

      const existing = monthCounts.get(monthKey);
      if (existing) {
        existing.count++;
      } else {
        monthCounts.set(monthKey, { year, count: 1 });
      }
    } catch {
      // Invalid date, skip
    }
  });

  if (monthCounts.size === 0) return null;

  // Find month with highest count
  let maxMonth: ActiveMonth | null = null;
  let maxCount = 0;

  monthCounts.forEach((data, monthKey) => {
    if (data.count > maxCount) {
      maxCount = data.count;
      const [year, month] = monthKey.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const displayName = new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(date);

      maxMonth = {
        monthKey,
        year: data.year,
        count: data.count,
        displayName,
      };
    }
  });

  return maxMonth;
}

/**
 * Compute release year breakdown grouped by decade
 */
export function computeReleaseYearBreakdown(
  items: EnrichedListItem[]
): ReleaseYearBreakdown[] {
  const yearCounts = new Map<number, number>();

  items.forEach((item) => {
    // Try releaseDate for movies, firstAirDate for TV
    const dateStr = item.details?.release_date || item.details?.first_air_date || item.releaseDate || item.firstAirDate;
    if (!dateStr) return;

    try {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      if (year && !isNaN(year)) {
        yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
      }
    } catch {
      // Invalid date, skip
    }
  });

  // Convert to breakdown array with decade labels
  const breakdown: ReleaseYearBreakdown[] = [];
  yearCounts.forEach((count, year) => {
    const decadeStart = Math.floor(year / 10) * 10;
    const decade = `${decadeStart}s`;

    breakdown.push({
      year,
      decade,
      count,
    });
  });

  // Sort by year descending
  return breakdown.sort((a, b) => b.year - a.year);
}
