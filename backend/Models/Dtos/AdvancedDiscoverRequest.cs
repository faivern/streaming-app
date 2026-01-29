namespace backend.Models.Dtos
{
    /// <summary>
    /// Request parameters for advanced media discovery with filters.
    /// Maps to TMDB's /discover/{mediaType} endpoint parameters.
    /// </summary>
    public class AdvancedDiscoverRequest
    {
        /// <summary>
        /// Media type to discover: "movie" or "tv"
        /// </summary>
        public string MediaType { get; set; } = "movie";

        /// <summary>
        /// Genre IDs to filter by (comma-joined for TMDB's with_genres)
        /// </summary>
        public int[]? GenreIds { get; set; }

        /// <summary>
        /// Minimum release year (maps to primary_release_date.gte / first_air_date.gte)
        /// </summary>
        public int? PrimaryReleaseYearGte { get; set; }

        /// <summary>
        /// Maximum release year (maps to primary_release_date.lte / first_air_date.lte)
        /// </summary>
        public int? PrimaryReleaseYearLte { get; set; }

        /// <summary>
        /// Minimum vote average (0-10, maps to vote_average.gte)
        /// </summary>
        public decimal? VoteAverageGte { get; set; }

        /// <summary>
        /// Minimum runtime in minutes (maps to with_runtime.gte)
        /// </summary>
        public int? RuntimeGte { get; set; }

        /// <summary>
        /// Maximum runtime in minutes (maps to with_runtime.lte)
        /// </summary>
        public int? RuntimeLte { get; set; }

        /// <summary>
        /// Original language ISO 639-1 code (maps to with_original_language)
        /// </summary>
        public string? Language { get; set; }

        /// <summary>
        /// Sort order (default: popularity.desc)
        /// Options: popularity.desc, popularity.asc, vote_average.desc, vote_average.asc,
        /// primary_release_date.desc, primary_release_date.asc
        /// </summary>
        public string SortBy { get; set; } = "popularity.desc";

        /// <summary>
        /// Page number for pagination (default: 1)
        /// </summary>
        public int Page { get; set; } = 1;
    }
}
