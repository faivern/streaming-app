using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using backend.Models;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
namespace backend.Services
{
    public class TmdbService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly IMemoryCache _cache;
        private readonly ILogger<TmdbService> _logger;

        public TmdbService(HttpClient httpClient, IConfiguration configuration, IMemoryCache cache, ILogger<TmdbService> logger)
        {
            _httpClient = httpClient;
            _apiKey = configuration["TMDB:ApiKey"];
            _cache = cache;
            _logger = logger;
        }

        private async Task<string> FetchWithCacheAsync(string cacheKey, string url, TimeSpan cacheDuration)
        {
            if (_cache.TryGetValue(cacheKey, out string cachedData))
            {
                _logger.LogInformation($"✅ Cache hit for key: {cacheKey}");
                return cachedData;
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

            return cachedData;
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





        //----------------------------UPCOMING_MOVIES------------------------------------
        public async Task<string> GetUpcomingMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/upcoming?api_key={_apiKey}";
            return await FetchWithCacheAsync("upcoming_movies", url, TimeSpan.FromHours(6));
        }
        //----------------------------------------------------------------------------




        //--------------------------------TOP_RATED_MOVIES--------------------------------
        public async Task<string> GetTopRatedMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/top_rated?api_key={_apiKey}";
            return await FetchWithCacheAsync("top_rated_movies", url, TimeSpan.FromHours(6));
        }
        //--------------------------------------------------------------------------------





        //---------------------------------TRENDING----------------------------------------

        //ALL
        public async Task<string> GetTrendingAllWeekly()
        {
            var url = $"https://api.themoviedb.org/3/trending/all/day?api_key={_apiKey}";
            return await FetchWithCacheAsync("trending_all", url, TimeSpan.FromHours(6));
        }
        //MOVIES
        public async Task<string> GetTrendingMoviesWeekly()
        {
            var url = $"https://api.themoviedb.org/3/trending/movie/day?api_key={_apiKey}";
            return await FetchWithCacheAsync("trending_movies", url, TimeSpan.FromHours(6));
        }
        //TV
        public async Task<string> GetTrendingTvWeekly()
        {
            var url = $"https://api.themoviedb.org/3/trending/tv/day?api_key={_apiKey}";
            return await FetchWithCacheAsync("trending_tv", url, TimeSpan.FromHours(6));
        }

        //----------------------------------------------------------------------------





        //--------------------------DETAILS----------------------------------
        public async Task<string> GetMovieDetailsAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}?api_key={_apiKey}";
            return await FetchWithCacheAsync($"movie_details_{movieId}", url, TimeSpan.FromHours(6));
        }

        public async Task<string> GetShowDetailsAsync(int series_id)
        {
            var url = $"https://api.themoviedb.org/3/tv/{series_id}?api_key={_apiKey}";
            return await FetchWithCacheAsync($"show_details_{series_id}", url, TimeSpan.FromHours(6));
        }
        //----------------------------------------------------------------------------




        //--------------------------------VIDEOS---------------------------------------
        public async Task<string> GetMovieVideosAsync(int movie_id)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key={_apiKey}";
            return await FetchWithCacheAsync($"movie_videos_{movie_id}", url, TimeSpan.FromHours(6));
        }

        public async Task<(string? Name, string? Url)> GetMovieTrailerAsync(int movieId)
        {
            var json = await FetchWithCacheAsync(
                $"movie_trailer_{movieId}",
                $"https://api.themoviedb.org/3/movie/{movieId}/videos?api_key={_apiKey}",
                TimeSpan.FromHours(6)
            );

            Console.WriteLine($"🧾 Raw JSON for movie {movieId}:\n{json}");

            var videoResponse = JsonSerializer.Deserialize<TmdbVideoResponse>(json);

            var firstYoutubeVideo = videoResponse?.results?
                .FirstOrDefault(v => v.site == "YouTube");

            if (firstYoutubeVideo == null)
            {
                Console.WriteLine($"❌ No YouTube video found for movie ID {movieId}");
                return (null, null);
            }

            Console.WriteLine($"✅ Found video: {firstYoutubeVideo.name} ({firstYoutubeVideo.key})");
            return (
                firstYoutubeVideo.name,
                $"https://www.youtube.com/embed/{firstYoutubeVideo.key}"
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

    }
}