using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

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

        public async Task<string> GetPopularMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/popular?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }

        public async Task<string> GetUpcomingMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/upcoming?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }

        public async Task<string> GetTopRatedMoviesAsync()
        {
            var url = $"https://api.themoviedb.org/3/movie/top_rated?api_key={_apiKey}";
            return await FetchFromTmdbAsync(url);
        }

        public async Task<string> GetTrendingAllWeekly()
        {
            var url = $"https://api.themoviedb.org/3/trending/all/week?api_key={_apiKey}";
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
