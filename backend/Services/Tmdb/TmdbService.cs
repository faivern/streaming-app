using backend.Constants;
using backend.Models.Entities;
using backend.Models.Enums;
using backend.Models.Tmdb;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services.Tmdb
{
    public partial class TmdbService : ITmdbService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly IMemoryCache _cache;
        private readonly ILogger<TmdbService> _logger;
        private static readonly TimeSpan CacheDurationVideos = CacheDurations.Standard;

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
            var url = $"https://api.themoviedb.org/3/search/multi?api_key={_apiKey}&query={Uri.EscapeDataString(query)}&include_adult=false";
            return await FetchWithCacheAsync($"search_multi_{query}", url, CacheDurations.Standard);
        }
        //----------------------------------------------------------------------------


        //-----------------------------POPULAR---------------------------------------
        public async Task<string> GetPopularMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/popular?api_key={_apiKey}";
            return await FetchWithCacheAsync("popular_movies", url, CacheDurations.Standard);
        }

        public async Task<string> GetPopularShowsAsync()
        {
            var url = $"https://api.themoviedb.org/3/tv/popular?api_key={_apiKey}";
            return await FetchWithCacheAsync("popular_shows", url, CacheDurations.Standard);
        }
        //----------------------------------------------------------------------------





        //----------------------------UPCOMING------------------------------------
        public async Task<string> GetUpcomingMoviesAsync()
        {
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var url = $"https://api.themoviedb.org/3/discover/movie?api_key={_apiKey}&primary_release_date.gte={today}&sort_by=popularity.desc&include_adult=false";
            return await FetchWithCacheAsync($"upcoming_movies_{today}", url, CacheDurations.Standard);
        }

        public async Task<string> GetUpcomingTvAsync()
        {
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var url = $"https://api.themoviedb.org/3/discover/tv?api_key={_apiKey}&first_air_date.gte={today}&sort_by=popularity.desc&include_adult=false";
            return await FetchWithCacheAsync($"upcoming_tv_{today}", url, CacheDurations.Standard);
        }
        //----------------------------------------------------------------------------




        //--------------------------------TOP_RATED--------------------------------
        private const int MinVoteCountForTopRatedMovies = 15000;
        private const int MinVoteCountForTopRatedShows = 10000;

        public async Task<string> GetTopRatedMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/discover/movie?api_key={_apiKey}&sort_by=vote_average.desc&vote_count.gte={MinVoteCountForTopRatedMovies}&include_adult=false";
            return await FetchWithCacheAsync("top_rated_movies", url, CacheDurations.Standard);
        }

        public async Task<string> GetTopRatedTvAsync()
        {
            var url = $"https://api.themoviedb.org/3/discover/tv?api_key={_apiKey}&sort_by=vote_average.desc&vote_count.gte={MinVoteCountForTopRatedShows}&include_adult=false";
            return await FetchWithCacheAsync("top_rated_tv", url, CacheDurations.Standard);
        }
        //--------------------------------------------------------------------------





        //---------------------------------TRENDING----------------------------------------

        //ALL
        public async Task<string> GetTrendingAllDailyAsync()
        {
            var url = $"https://api.themoviedb.org/3/trending/all/day?api_key={_apiKey}";
            return await FetchWithCacheAsync("trending_all", url, CacheDurations.Standard);
        }

        public async Task<string> GetTrendingMoviesDailyAsync(int page = 1)
        {
            var url = $"https://api.themoviedb.org/3/trending/movie/day?api_key={_apiKey}&page={page}";
            return await FetchWithCacheAsync($"trending_movies_page_{page}", url, CacheDurations.Standard);
        }

        public async Task<string> GetTrendingTvDailyAsync(int page = 1)
        {
            var url = $"https://api.themoviedb.org/3/trending/tv/day?api_key={_apiKey}&page={page}";
            return await FetchWithCacheAsync($"trending_tv_page_{page}", url, CacheDurations.Standard);
        }
        //----------------------------------------------------------------------------





        //--------------------------DETAILS----------------------------------
        public async Task<string> GetMovieDetailsAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}?api_key={_apiKey}";
            return await FetchWithCacheAsync($"movie_details_{movieId}", url, CacheDurations.Standard);
        }

        public async Task<string> GetShowDetailsAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}?api_key={_apiKey}&append_to_response=external_ids";
            return await FetchWithCacheAsync($"show_details_{seriesId}", url, CacheDurations.Standard);
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

            _logger.LogDebug("Raw JSON for {Type} {Id}: {Json}", type, id, json);

            var videoResponse = JsonSerializer.Deserialize<TmdbVideoResponse>(json);

            var firstYoutubeVideo = videoResponse?.Results?
                .FirstOrDefault(v => v.Site == "YouTube");

            if (firstYoutubeVideo == null)
            {
                _logger.LogDebug("No YouTube video found for {Type} ID {Id}", type, id);
                return (null, null);
            }

            _logger.LogDebug("Found video: {Name} ({Key})", firstYoutubeVideo.Name, firstYoutubeVideo.Key);
            return (
                firstYoutubeVideo.Name,
                $"https://www.youtube.com/embed/{firstYoutubeVideo.Key}?modestbranding=1"
            );
        }
        //----------------------------------------------------------------------------




        //--------------------------------KEYWORDS------------------------------------
        // Get keywords for a movie by its ID
        public async Task<string> GetMovieKeywordsAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}/keywords?api_key={_apiKey}";
            return await FetchWithCacheAsync($"movie_keywords_{movieId}", url, CacheDurations.Standard);
        }

        // Get keywords for a TV show by its ID
        public async Task<string> GetShowKeywordsAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/keywords?api_key={_apiKey}";
            return await FetchWithCacheAsync($"show_keywords_{seriesId}", url, CacheDurations.Standard);
        }
        //----------------------------------------------------------------------------


        //--------------------------------CREDITS---------------------------------------
        // Get credits for a series by its ID
        public async Task<string> GetShowCreditsAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/aggregate_credits?api_key={_apiKey}";
            return await FetchWithCacheAsync($"show_credits_{seriesId}", url, CacheDurations.Standard);
        }
        // Get credits for a movie by its ID
        public async Task<string> GetMovieCreditsAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}/credits?api_key={_apiKey}";
            return await FetchWithCacheAsync($"movie_credits_{movieId}", url, CacheDurations.Standard);
        }
        //----------------------------------------------------------------------------


        //--------------------------------SIMILAR---------------------------------------
        // Get similar movies for a movie by its ID
        public async Task<string> GetSimilarMoviesAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}/similar?api_key={_apiKey}";
            return await FetchWithCacheAsync($"similar_movies_{movieId}", url, CacheDurations.Standard);
        }
        // Get similar shows for a show by its ID
        public async Task<string> GetSimilarShowsAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/similar?api_key={_apiKey}";
            return await FetchWithCacheAsync($"similar_shows_{seriesId}", url, CacheDurations.Standard);
        }
        //----------------------------------------------------------------------------

        
        //-------------------------------PERSON------------------------------------------
        public async Task<string> GetPersonDetailsAsync(int personId)
        {
            var url = $"https://api.themoviedb.org/3/person/{personId}?api_key={_apiKey}";
            return await FetchWithCacheAsync($"person_details_{personId}", url, CacheDurations.Standard);
        }

        //------------------------------DISCOVER--------------------------------------------
        //Movie
        public async Task<string> GetDiscoverMovieAsync()
        {
            var url = $"https://api.themoviedb.org/3/discover/movie?api_key={_apiKey}&include_adult=false";
            return await FetchWithCacheAsync("discover_movies", url, CacheDurations.Standard);
        }

        public async Task<string> GetDiscoverTvAsync()
        {
            var url = $"https://api.themoviedb.org/3/discover/tv?api_key={_apiKey}&include_adult=false";
            return await FetchWithCacheAsync("discover_tv", url, CacheDurations.Standard);
        }
        //-----------------------------------------------------------------------------------

        //------------------------------COMBINED CREDITS - PERSON--------------------------------------------
        public async Task<string> GetCombinedCreditsAsync(int personId)
        {
            var url = $"https://api.themoviedb.org/3/person/{personId}/combined_credits?api_key={_apiKey}";
            return await FetchWithCacheAsync($"combined_credits_{personId}", url, CacheDurations.Standard);
        }
        //-----------------------------------------------------------------------------------

        //------------------------------GENRES--------------------------------------------
        //MOVIE
        public async Task<string> GetMovieGenreAsync()
        {
            var url = $"https://api.themoviedb.org/3/genre/movie/list?api_key={_apiKey}";
            return await FetchWithCacheAsync("movie_genre", url, CacheDurations.Standard);
        }

        public async Task<string> GetTvGenreAsync()
        {
            var url = $"https://api.themoviedb.org/3/genre/tv/list?api_key={_apiKey}";
            return await FetchWithCacheAsync("tv_genre", url, CacheDurations.Standard);
        }

        public async Task<string> DiscoverByGenreAsync(string mediaType, int genreId, int page, string sortBy = "popularity.desc")
        {
            var actualGenreId = genreId;
            var extraParams = "";

            if (genreId == Constants.CustomGenres.AnimeId)
            {
                actualGenreId = Constants.CustomGenres.AnimationId;
                extraParams = $"&with_original_language={Constants.CustomGenres.JapaneseLanguage}";
            }

            var cacheKey = $"discover_{mediaType}_genre_{genreId}_sort_{sortBy}_page_{page}";
            var url = $"https://api.themoviedb.org/3/discover/{mediaType}?api_key={_apiKey}&with_genres={actualGenreId}&sort_by={sortBy}&page={page}&include_adult=false{extraParams}";
            return await FetchWithCacheAsync(cacheKey, url, CacheDurations.Standard);
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
            int page = 1,
            int? withWatchProviders = null,
            string? watchRegion = null)
        {
            // Build query parameters dynamically
            var queryParams = new List<string>
            {
                $"api_key={_apiKey}",
                $"sort_by={sortBy}",
                $"page={page}",
                "include_adult=false"
            };

            // Genres (comma-separated)
            if (genreIds != null && genreIds.Length > 0)
            {
                queryParams.Add($"with_genres={string.Join(",", genreIds)}");
            }

            // Year range - use appropriate date fields based on media type
            var dateField = mediaType == MediaTypes.Movie ? "primary_release_date" : "first_air_date";
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
            if (mediaType == MediaTypes.Movie)
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

            // Watch providers filter
            if (withWatchProviders.HasValue)
            {
                queryParams.Add($"with_watch_providers={withWatchProviders.Value}");
                // watch_region is required when filtering by watch providers
                queryParams.Add($"watch_region={watchRegion ?? "US"}");
            }

            var queryString = string.Join("&", queryParams);
            var url = $"https://api.themoviedb.org/3/discover/{mediaType}?{queryString}";

            // Debug: log the URL being generated
            _logger.LogInformation($"[AdvancedDiscover] TMDB URL: {url.Replace(_apiKey, "***")}");

            // Build cache key from all parameters for unique caching
            var cacheKey = $"advanced_discover_{mediaType}_g{string.Join("-", genreIds ?? Array.Empty<int>())}_y{primaryReleaseYearGte}-{primaryReleaseYearLte}_r{voteAverageGte}_rt{runtimeGte}-{runtimeLte}_l{language}_s{sortBy}_p{page}_wp{withWatchProviders}_wr{watchRegion}";

            return await FetchWithCacheAsync(cacheKey, url, CacheDurations.Standard);
        }

        //------------------------------COLLECTION--------------------------------------------

        // SEARCH collections (by name like "Star Wars")
        public Task<string> SearchCollectionsAsync(string query, int page = 1, string lang = "en-US")
        {
            var q = Uri.EscapeDataString(query ?? string.Empty);
            var url =
                $"https://api.themoviedb.org/3/search/collection?api_key={_apiKey}&query={q}&page={page}&include_adult=false&language={lang}";
            var cacheKey = $"search_collection::{lang}::p{page}::{query?.ToLowerInvariant()}";
            return FetchWithCacheAsync(cacheKey, url, CacheDurations.WatchProvider);
        }

        // GET a single collection (all movies in franchise)
        public Task<string> GetCollectionByIdAsync(int collectionId, string lang = "en-US")
        {
            var url = $"https://api.themoviedb.org/3/collection/{collectionId}?api_key={_apiKey}&language={lang}";
            var cacheKey = $"collection_by_id::{lang}::{collectionId}";
            return FetchWithCacheAsync(cacheKey, url, CacheDurations.StaticReference);
        }

//------------------------------IMAGES--------------------------------------------
        public async Task<string> GetMovieImagesAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}/images?api_key={_apiKey}";
            var cacheKey = $"movie_images_{movieId}";
            return await FetchWithCacheAsync(cacheKey, url, CacheDurations.Standard);
        }

        public async Task<string> GetSeriesImagesAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/images?api_key={_apiKey}";
            var cacheKey = $"tv_images_{seriesId}";
            return await FetchWithCacheAsync(cacheKey, url, CacheDurations.Standard);
        }

        //------------------------------TYPED DETAIL FETCHERS--------------------------------------
        public async Task<TmdbMovieDetails?> GetMovieDetailsTypedAsync(int movieId)
        {
            var json = await GetMovieDetailsAsync(movieId);
            return JsonSerializer.Deserialize<TmdbMovieDetails>(json);
        }

        public async Task<TmdbTvDetails?> GetTvDetailsTypedAsync(int seriesId)
        {
            var json = await GetShowDetailsAsync(seriesId);
            return JsonSerializer.Deserialize<TmdbTvDetails>(json);
        }
        //-----------------------------------------------------------------------------------

        //------------------------------WATCH PROVIDERS--------------------------------------------
        public async Task<string> GetMovieWatchProvidersAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}/watch/providers?api_key={_apiKey}";
            return await FetchWithCacheAsync($"movie_watch_providers_{movieId}", url, CacheDurations.WatchProvider);
        }

        public async Task<string> GetTvWatchProvidersAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/watch/providers?api_key={_apiKey}";
            return await FetchWithCacheAsync($"tv_watch_providers_{seriesId}", url, CacheDurations.WatchProvider);
        }

        public async Task<string> GetWatchProviderRegionsAsync()
        {
            var url = $"https://api.themoviedb.org/3/watch/providers/regions?api_key={_apiKey}";
            return await FetchWithCacheAsync("watch_provider_regions", url, CacheDurations.StaticReference);
        }

        // Get list of all movie watch providers for a region
        public async Task<string> GetMovieWatchProvidersListAsync(string watchRegion = "US")
        {
            var url = $"https://api.themoviedb.org/3/watch/providers/movie?api_key={_apiKey}&watch_region={watchRegion}";
            return await FetchWithCacheAsync($"movie_watch_providers_list_{watchRegion}", url, CacheDurations.StaticReference);
        }

        // Get list of all TV watch providers for a region
        public async Task<string> GetTvWatchProvidersListAsync(string watchRegion = "US")
        {
            var url = $"https://api.themoviedb.org/3/watch/providers/tv?api_key={_apiKey}&watch_region={watchRegion}";
            return await FetchWithCacheAsync($"tv_watch_providers_list_{watchRegion}", url, CacheDurations.StaticReference);
        }
        //-----------------------------------------------------------------------------------

    }
}