using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using backend.Models;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services
{
    public enum MediaType { Movie, Tv }
    public partial class TmdbService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly IMemoryCache _cache;
        private readonly ILogger<TmdbService> _logger;
        private static readonly TimeSpan CacheDurationVideos = TimeSpan.FromHours(6);

        public TmdbService(HttpClient httpClient, IConfiguration cfg, IMemoryCache cache, ILogger<TmdbService> logger)
        {
            _httpClient = httpClient;
            _apiKey = cfg["TMDB:ApiKey"] ?? throw new InvalidOperationException("TMDB:API-key is missing!");
            _cache = cache;
            _logger = logger;
        }

        private async Task<string> FetchWithCacheAsync(string cacheKey, string url, TimeSpan cacheDuration)
        {
            if (_cache.TryGetValue(cacheKey, out string? cachedData))
            {
                _logger.LogInformation($"✅ Cache hit for key: {cacheKey}");
                return cachedData ?? string.Empty;
            }

            _logger.LogInformation($"❌ Cache miss for key: {cacheKey} — fetching from TMDB");

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException($"TMDB API error: {response.StatusCode}");

            cachedData = await response.Content.ReadAsStringAsync();

            _cache.Set(cacheKey, cachedData, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = cacheDuration
            });

            return cachedData ?? string.Empty;
        }

        //-----------------------------SEARCH MULTI---------------------------------------
        public async Task<string> SearchMultiAsync(string query)
        {
            var url = $"https://api.themoviedb.org/3/search/multi?api_key={_apiKey}&query={Uri.EscapeDataString(query)}";
            return await FetchWithCacheAsync($"search_multi_{query}", url, TimeSpan.FromHours(6));
        }
        //----------------------------------------------------------------------------


        //-----------------------------POPULAR---------------------------------------
        public async Task<string> GetPopularMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/popular?api_key={_apiKey}";
            return await FetchWithCacheAsync("popular_movies", url, TimeSpan.FromHours(6));
        }

        public async Task<string> GetPopularShowsAsync()
        {
            var url = $"https://api.themoviedb.org/3/tv/popular?api_key={_apiKey}";
            return await FetchWithCacheAsync("popular_shows", url, TimeSpan.FromHours(6));
        }
        //----------------------------------------------------------------------------





        //----------------------------UPCOMING------------------------------------
        public async Task<string> GetUpcomingMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/upcoming?api_key={_apiKey}";
            return await FetchWithCacheAsync("upcoming_movies", url, TimeSpan.FromHours(6));
        }

        public async Task<string> GetUpcomingTvAsync()
        {
            var url = $"https://api.themoviedb.org/3/tv/on_the_air?api_key={_apiKey}";
            return await FetchWithCacheAsync("upcoming_tv", url, TimeSpan.FromHours(6));
        }
        //----------------------------------------------------------------------------




        //--------------------------------TOP_RATED--------------------------------
        public async Task<string> GetTopRatedMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/top_rated?api_key={_apiKey}";
            return await FetchWithCacheAsync("top_rated_movies", url, TimeSpan.FromHours(6));
        }

        public async Task<string> GetTopRatedTvAsync()
        {
            var url = $"https://api.themoviedb.org/3/tv/top_rated?api_key={_apiKey}";
            return await FetchWithCacheAsync("top_rated_tv", url, TimeSpan.FromHours(6));
        }
        //--------------------------------------------------------------------------





        //---------------------------------TRENDING----------------------------------------

        //ALL
        public async Task<string> GetTrendingAllDaily()
        {
            var url = $"https://api.themoviedb.org/3/trending/all/day?api_key={_apiKey}";
            return await FetchWithCacheAsync("trending_all", url, TimeSpan.FromHours(6));
        }
        //MOVIES
        public async Task<string> GetTrendingMoviesWeekly(int page = 1)
        {
            var url = $"https://api.themoviedb.org/3/trending/movie/day?api_key={_apiKey}&page={page}";
            return await FetchWithCacheAsync($"trending_movies_page_{page}", url, TimeSpan.FromHours(6));
        }
        //TV
        public async Task<string> GetTrendingTvWeekly(int page = 1)
        {
            var url = $"https://api.themoviedb.org/3/trending/tv/day?api_key={_apiKey}&page={page}";
            return await FetchWithCacheAsync($"trending_tv_page_{page}", url, TimeSpan.FromHours(6));
        }
        /*
         *maybe later - generic method for trending - how would it work with swagger? can i send parameters?
        public async Task<string> GetTrendingMedia(int page = 1, string mediatype, string timewindow)
        {
            var url = $"https://api.themoviedb.org/3/trending/{mediatype}/{timewindow}?api_key={_apiKey}&page={page}";

        }
        */
        //----------------------------------------------------------------------------





        //--------------------------DETAILS----------------------------------
        public async Task<string> GetMovieDetailsAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}?api_key={_apiKey}";
            return await FetchWithCacheAsync($"movie_details_{movieId}", url, TimeSpan.FromHours(6));
        }

        public async Task<string> GetShowDetailsAsync(int series_id)
        {
            var url = $"https://api.themoviedb.org/3/tv/{series_id}?api_key={_apiKey}&append_to_response=external_ids";
            return await FetchWithCacheAsync($"show_details_{series_id}", url, TimeSpan.FromHours(6));
        }
        //----------------------------------------------------------------------------




        //--------------------------------VIDEOS---------------------------------------
        public async Task<string> GetVideosAsync(MediaType type, int id)
        {
            var path = type == MediaType.Movie ? $"movie/{id}/videos" : $"tv/{id}/videos";
            var url = $"https://api.themoviedb.org/3/{path}?api_key={_apiKey}";
            var cacheKey = $"{type.ToString().ToLowerInvariant()}_videos_{id}";
            return await FetchWithCacheAsync(cacheKey, url, CacheDurationVideos);
        }

        public async Task<(string? Name, string? Url)> GetTrailerAsync(MediaType type, int id)
        {
            var path = type == MediaType.Movie ? $"movie/{id}/videos" : $"tv/{id}/videos";
            var url = $"https://api.themoviedb.org/3/{path}?api_key={_apiKey}";
            var cacheKey = $"{type.ToString().ToLowerInvariant()}_trailer_{id}";

            var json = await FetchWithCacheAsync(cacheKey, url, CacheDurationVideos);

            Console.WriteLine($"Raw JSON for {type} {id}:\n{json}");

            var videoResponse = JsonSerializer.Deserialize<TmdbVideoResponse>(json);

            var firstYoutubeVideo = videoResponse?.Results?
                .FirstOrDefault(v => v.Site == "YouTube");

            if (firstYoutubeVideo == null)
            {
                Console.WriteLine($"No YouTube video found for {type} ID {id}");
                return (null, null);
            }

            Console.WriteLine($"Found video: {firstYoutubeVideo.Name} ({firstYoutubeVideo.Key})");
            return (
                firstYoutubeVideo.Name,
                $"https://www.youtube.com/embed/{firstYoutubeVideo.Key}"
            );
        }
        //----------------------------------------------------------------------------




        //--------------------------------KEYWORDS------------------------------------
        // Get keywords for a movie by its ID
        public async Task<string> GetMovieKeywordsAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}/keywords?api_key={_apiKey}";
            return await FetchWithCacheAsync($"movie_keywords_{movieId}", url, TimeSpan.FromHours(6));
        }

        // Get keywords for a TV show by its ID
        public async Task<string> GetShowKeywordsAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/keywords?api_key={_apiKey}";
            return await FetchWithCacheAsync($"show_keywords_{seriesId}", url, TimeSpan.FromHours(6));
        }
        //----------------------------------------------------------------------------


        //--------------------------------CREDITS---------------------------------------
        // Get credits for a series by its ID
        public async Task<string> GetShowCreditsAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/aggregate_credits?api_key={_apiKey}";
            return await FetchWithCacheAsync($"show_credits_{seriesId}", url, TimeSpan.FromHours(6));
        }
        // Get credits for a movie by its ID
        public async Task<string> GetMovieCreditsAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}/credits?api_key={_apiKey}";
            return await FetchWithCacheAsync($"movie_credits_{movieId}", url, TimeSpan.FromHours(6));
        }
        //----------------------------------------------------------------------------


        //--------------------------------SIMILAR---------------------------------------
        // Get similar movies for a movie by its ID
        public async Task<string> GetSimilarMoviesAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}/similar?api_key={_apiKey}";
            return await FetchWithCacheAsync($"similar_movies_{movieId}", url, TimeSpan.FromHours(6));
        }
        // Get similar shows for a show by its ID
        public async Task<string> GetSimilarShowsAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/similar?api_key={_apiKey}";
            return await FetchWithCacheAsync($"similar_shows_{seriesId}", url, TimeSpan.FromHours(6));
        }
        //----------------------------------------------------------------------------

        
        //-------------------------------PERSON------------------------------------------
        public async Task<string> GetPersonDetails(int person_id)
        {
            var url = $"https://api.themoviedb.org/3/person/{person_id}?api_key={_apiKey}";
            return await FetchWithCacheAsync($"person_details_{person_id}", url, TimeSpan.FromHours(6));
        }

        //------------------------------DISCOVER--------------------------------------------
        //Movie
        public async Task<string> GetDiscoverMovie()
        {
            var url = $"https://api.themoviedb.org/3/discover/movie?api_key={_apiKey}";
            return await FetchWithCacheAsync("discover_movies", url, TimeSpan.FromHours(6));
        }
        //Show
        public async Task<string> GetDiscoverTv()
        {
            var url = $"https://api.themoviedb.org/3/discover/tv?api_key={_apiKey}";
            return await FetchWithCacheAsync("discover_tv", url, TimeSpan.FromHours(6));
        }
        //-----------------------------------------------------------------------------------

        //------------------------------COMBINED CREDITS - PERSON--------------------------------------------
        public async Task<string> GetCombinedCredits(int person_id)
        {
            var url = $"https://api.themoviedb.org/3/person/{person_id}/combined_credits?api_key={_apiKey}";
            return await FetchWithCacheAsync($"combined_credits_{person_id}", url, TimeSpan.FromHours(6));
        }
        //-----------------------------------------------------------------------------------

        //------------------------------GENRES--------------------------------------------
        //MOVIE
        public async Task<string> GetMovieGenre()
        {
            var url = $"https://api.themoviedb.org/3/genre/movie/list?api_key={_apiKey}";
            return await FetchWithCacheAsync("movie_genre", url, TimeSpan.FromHours(6));
        }
        //TV
        public async Task<string> GetTvGenre()
        {
            var url = $"https://api.themoviedb.org/3/genre/tv/list?api_key={_apiKey}";
            return await FetchWithCacheAsync("tv_genre", url, TimeSpan.FromHours(6));
        }

        public async Task<string> DiscoverByGenreAsync(string mediaType, int genreId, int page)
        {
            var cacheKey = $"discover_{mediaType}_genre_{genreId}_page_{page}";
            var url = $"https://api.themoviedb.org/3/discover/{mediaType}?api_key={_apiKey}&with_genres={genreId}&sort_by=popularity.desc&page={page}";
            return await FetchWithCacheAsync(cacheKey, url, TimeSpan.FromHours(6));
        }

        /// <summary>
        /// Advanced discover with multiple filter parameters.
        /// Builds a dynamic TMDB discover URL based on provided filters.
        /// </summary>
        public async Task<string> AdvancedDiscoverAsync(
            string mediaType,
            int[]? genreIds = null,
            int? primaryReleaseYearGte = null,
            int? primaryReleaseYearLte = null,
            decimal? voteAverageGte = null,
            int? runtimeGte = null,
            int? runtimeLte = null,
            string? language = null,
            string sortBy = "popularity.desc",
            int page = 1)
        {
            // Build query parameters dynamically
            var queryParams = new List<string>
            {
                $"api_key={_apiKey}",
                $"sort_by={sortBy}",
                $"page={page}",
                "include_adult=false",
                "vote_count.gte=50" // Ensure results have meaningful vote counts
            };

            // Genres (comma-separated)
            if (genreIds != null && genreIds.Length > 0)
            {
                queryParams.Add($"with_genres={string.Join(",", genreIds)}");
            }

            // Year range - use appropriate date fields based on media type
            var dateField = mediaType == "movie" ? "primary_release_date" : "first_air_date";
            if (primaryReleaseYearGte.HasValue)
            {
                queryParams.Add($"{dateField}.gte={primaryReleaseYearGte.Value}-01-01");
            }
            if (primaryReleaseYearLte.HasValue)
            {
                queryParams.Add($"{dateField}.lte={primaryReleaseYearLte.Value}-12-31");
            }

            // Vote average (rating)
            if (voteAverageGte.HasValue)
            {
                queryParams.Add($"vote_average.gte={voteAverageGte.Value}");
            }

            // Runtime (movies only - TV uses episode runtime which is different)
            if (mediaType == "movie")
            {
                if (runtimeGte.HasValue)
                {
                    queryParams.Add($"with_runtime.gte={runtimeGte.Value}");
                }
                if (runtimeLte.HasValue)
                {
                    queryParams.Add($"with_runtime.lte={runtimeLte.Value}");
                }
            }

            // Original language
            if (!string.IsNullOrEmpty(language))
            {
                queryParams.Add($"with_original_language={language}");
            }

            var queryString = string.Join("&", queryParams);
            var url = $"https://api.themoviedb.org/3/discover/{mediaType}?{queryString}";

            // Build cache key from all parameters for unique caching
            var cacheKey = $"advanced_discover_{mediaType}_g{string.Join("-", genreIds ?? Array.Empty<int>())}_y{primaryReleaseYearGte}-{primaryReleaseYearLte}_r{voteAverageGte}_rt{runtimeGte}-{runtimeLte}_l{language}_s{sortBy}_p{page}";

            return await FetchWithCacheAsync(cacheKey, url, TimeSpan.FromHours(6));
        }

        //------------------------------COLLECTION--------------------------------------------

        // SEARCH collections (by name like "Star Wars")
        public Task<string> SearchCollectionsAsync(string query, int page = 1, string lang = "en-US", bool includeAdult = false)
        {
            var q = Uri.EscapeDataString(query ?? string.Empty);
            var url =
                $"https://api.themoviedb.org/3/search/collection?api_key={_apiKey}&query={q}&page={page}&include_adult={includeAdult.ToString().ToLower()}&language={lang}";
            var cacheKey = $"search_collection::{lang}::{includeAdult}::p{page}::{query?.ToLowerInvariant()}";
            return FetchWithCacheAsync(cacheKey, url, TimeSpan.FromHours(12));
        }

        // GET a single collection (all movies in franchise)
        public Task<string> GetCollectionByIdAsync(int collectionId, string lang = "en-US")
        {
            var url = $"https://api.themoviedb.org/3/collection/{collectionId}?api_key={_apiKey}&language={lang}";
            var cacheKey = $"collection_by_id::{lang}::{collectionId}";
            return FetchWithCacheAsync(cacheKey, url, TimeSpan.FromHours(24));
        }

        // COLLECTION DETAILS
        public async Task<string> GetCollectionDetailsAsync(int collectionId)
        {
            var url = $"https://api.themoviedb.org/3/collection/{collectionId}?api_key={_apiKey}";
            return await FetchWithCacheAsync($"collection_details_{collectionId}", url, TimeSpan.FromHours(6));
        }

        //------------------------------IMAGES--------------------------------------------
        public async Task<string> GetMovieImagesAsync(int movie_id)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movie_id}/images?api_key={_apiKey}";
            var cacheKey = $"movie_images_{movie_id}";
            return await FetchWithCacheAsync(cacheKey, url, TimeSpan.FromHours(6));
        }

        public async Task<string> GetSeriesImagesAsync(int series_id)
        {
            var url = $"https://api.themoviedb.org/3/tv/{series_id}/images?api_key={_apiKey}";
            var cacheKey = $"movie_images_{series_id}";
            return await FetchWithCacheAsync(cacheKey, url, TimeSpan.FromHours(6));
        }

        //------------------------------WATCH PROVIDERS--------------------------------------------
        public async Task<string> GetMovieWatchProvidersAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}/watch/providers?api_key={_apiKey}";
            return await FetchWithCacheAsync($"movie_watch_providers_{movieId}", url, TimeSpan.FromHours(12));
        }

        public async Task<string> GetTvWatchProvidersAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/watch/providers?api_key={_apiKey}";
            return await FetchWithCacheAsync($"tv_watch_providers_{seriesId}", url, TimeSpan.FromHours(12));
        }

        public async Task<string> GetWatchProviderRegionsAsync()
        {
            var url = $"https://api.themoviedb.org/3/watch/providers/regions?api_key={_apiKey}";
            return await FetchWithCacheAsync("watch_provider_regions", url, TimeSpan.FromHours(24));
        }
        //-----------------------------------------------------------------------------------

    }
}