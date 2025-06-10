using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : Controller
    {
        private readonly IConfiguration _configuration;
        private HttpClient _httpClient;

        // Constructor to inject IConfiguration and initialize HttpClient  
        public MoviesController(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularMovies()
        {
            var apiKey = _configuration["TMDB:ApiKey"];
            var tmdbUrl = $"https://api.themoviedb.org/3/movie/popular?api_key={apiKey}";

            var response = await _httpClient.GetAsync(tmdbUrl);

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Error fetching data from TMDB");
            }

            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }
    }
}
