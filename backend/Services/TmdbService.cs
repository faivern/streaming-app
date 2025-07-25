using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using backend.Models;
using System.Text.Json;

namespace backend.Services
{
    public class TmdbService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public TmdbService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["TMDB:ApiKey"];
        }



        //-----------------------------POPULAR---------------------------------------
        public async Task<string> GetPopularMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/popular?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }

        public async Task<string> GetPopularShowsAsync()
        {
            var url = $"https://api.themoviedb.org/3/tv/popular?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }
        //----------------------------------------------------------------------------





        //----------------------------UPCOMING_MOVIES------------------------------------
        public async Task<string> GetUpcomingMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/upcoming?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }
        //----------------------------------------------------------------------------




        //--------------------------------TOP_RATED_MOVIES--------------------------------
        public async Task<string> GetTopRatedMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/top_rated?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }
        //--------------------------------------------------------------------------------





        //---------------------------------TRENDING----------------------------------------

        //ALL
        public async Task<string> GetTrendingAllWeekly()
        {
            var url = $"https://api.themoviedb.org/3/trending/all/day?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }
        //MOVIES
        public async Task<string> GetTrendingMoviesWeekly()
        {
            var url = $"https://api.themoviedb.org/3/trending/movie/day?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }
        //TV
        public async Task<string> GetTrendingTvWeekly()
        {
            var url = $"https://api.themoviedb.org/3/trending/tv/day?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }

        //----------------------------------------------------------------------------





        //--------------------------DETAILS----------------------------------
        public async Task<string> GetMovieDetailsAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }

        public async Task<string> GetShowDetailsAsync(int series_id)
        {
            var url = $"https://api.themoviedb.org/3/tv/{series_id}?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }
        //----------------------------------------------------------------------------




        //--------------------------------VIDEOS---------------------------------------
        public async Task<string> GetMovieVideosAsync(int movie_id)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }

        public async Task<(string? Name, string? Url)> GetMovieTrailerAsync(int movieId)
        {
            var json = await FetchFromTmdbAsync($"https://api.themoviedb.org/3/movie/{movieId}/videos?api_key={_apiKey}");

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
            return await FetchFromTmdbAsync(url);
        }

        // Get keywords for a TV show by its ID
        public async Task<string> GetShowKeywordsAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/keywords?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }
        //----------------------------------------------------------------------------


        //--------------------------------CREDITS---------------------------------------
        // Get credits for a series by its ID
        public async Task<string> GetShowCreditsAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/aggregate_credits?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }
        // Get credits for a movie by its ID
        public async Task<string> GetMovieCreditsAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}/credits?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }
        //----------------------------------------------------------------------------


        //--------------------------------SIMILAR---------------------------------------
        // Get similar movies for a movie by its ID
        public async Task<string> GetSimilarMoviesAsync(int movieId)
        {
            var url = $"https://api.themoviedb.org/3/movie/{movieId}/similar?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }
        // Get similar shows for a show by its ID
        public async Task<string> GetSimilarShowsAsync(int seriesId)
        {
            var url = $"https://api.themoviedb.org/3/tv/{seriesId}/similar?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }
        //----------------------------------------------------------------------------

        s
        //-------------------------------PERSON------------------------------------------
        public async Task<string> GetPersonDetails(int person_id)
        {
            var url = $"https://api.themoviedb.org/3/person/{person_id}?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }


        private async Task<string> FetchFromTmdbAsync(string url)
        {
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"TMDB API error: {response.StatusCode}");
            }

            return await response.Content.ReadAsStringAsync();
        }


    }
}