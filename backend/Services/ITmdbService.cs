using backend.Models;

namespace backend.Services
{
    public interface ITmdbService
    {
        // Search
        Task<string> SearchMultiAsync(string query);

        // Popular
        Task<string> GetPopularMoviesAsync();
        Task<string> GetPopularShowsAsync();

        // Upcoming
        Task<string> GetUpcomingMoviesAsync();
        Task<string> GetUpcomingTvAsync();

        // Top Rated
        Task<string> GetTopRatedMoviesAsync();
        Task<string> GetTopRatedTvAsync();

        // Trending
        Task<string> GetTrendingAllDailyAsync();
        Task<string> GetTrendingMoviesDailyAsync(int page = 1);
        Task<string> GetTrendingTvDailyAsync(int page = 1);

        // Details
        Task<string> GetMovieDetailsAsync(int movieId);
        Task<string> GetShowDetailsAsync(int seriesId);
        Task<TmdbMovieDetails?> GetMovieDetailsTypedAsync(int movieId);
        Task<TmdbTvDetails?> GetTvDetailsTypedAsync(int seriesId);

        // Videos
        Task<string> GetVideosAsync(MediaType type, int id);
        Task<(string? Name, string? Url)> GetTrailerAsync(MediaType type, int id);

        // Keywords
        Task<string> GetMovieKeywordsAsync(int movieId);
        Task<string> GetShowKeywordsAsync(int seriesId);

        // Credits
        Task<string> GetMovieCreditsAsync(int movieId);
        Task<string> GetShowCreditsAsync(int seriesId);

        // Similar
        Task<string> GetSimilarMoviesAsync(int movieId);
        Task<string> GetSimilarShowsAsync(int seriesId);

        // Person
        Task<string> GetPersonDetailsAsync(int personId);
        Task<string> GetCombinedCreditsAsync(int personId);

        // Discover
        Task<string> GetDiscoverMovieAsync();
        Task<string> GetDiscoverTvAsync();
        Task<string> DiscoverByGenreAsync(string mediaType, int genreId, int page, string sortBy = "popularity.desc");
        Task<string> AdvancedDiscoverAsync(
            string mediaType,
            int[]? genreIds = null,
            int? primaryReleaseYearGte = null,
            int? primaryReleaseYearLte = null,
            decimal? voteAverageGte = null,
            int? runtimeGte = null,
            int? runtimeLte = null,
            string? language = null,
            string sortBy = "popularity.desc",
            int page = 1,
            int? withWatchProviders = null,
            string? watchRegion = null);

        // Genres
        Task<string> GetMovieGenreAsync();
        Task<string> GetTvGenreAsync();

        // Collections
        Task<string> SearchCollectionsAsync(string query, int page = 1, string lang = "en-US");
        Task<string> GetCollectionByIdAsync(int collectionId, string lang = "en-US");

        // Images
        Task<string> GetMovieImagesAsync(int movieId);
        Task<string> GetSeriesImagesAsync(int seriesId);

        // Watch Providers
        Task<string> GetMovieWatchProvidersAsync(int movieId);
        Task<string> GetTvWatchProvidersAsync(int seriesId);
        Task<string> GetWatchProviderRegionsAsync();
        Task<string> GetMovieWatchProvidersListAsync(string watchRegion = "US");
        Task<string> GetTvWatchProvidersListAsync(string watchRegion = "US");
    }
}
