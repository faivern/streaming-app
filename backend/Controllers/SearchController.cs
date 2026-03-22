using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using backend.Services;
using backend.Services.Tmdb;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/movies")]
    [EnableRateLimiting("standard")]
    public class SearchController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

        public SearchController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        [HttpGet("search/multi")]
        public async Task<IActionResult> SearchMulti(string query)
        {
            var data = await _tmdbService.SearchMultiAsync(query);
            return Content(data, "application/json");
        }
    }
}
