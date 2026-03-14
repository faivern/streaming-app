using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/movies")]
    public class TrendingController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

        public TrendingController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        [HttpGet("trending/all/day")]
        public async Task<IActionResult> GetTrendingAllDaily()
        {
            var data = await _tmdbService.GetTrendingAllDailyAsync();
            return Content(data, "application/json");
        }

        [HttpGet("trending/movie/day")]
        public async Task<IActionResult> GetTrendingMoviesDaily([FromQuery] int page = 1)
        {
            var data = await _tmdbService.GetTrendingMoviesDailyAsync(page);
            return Content(data, "application/json");
        }

        [HttpGet("trending/tv/day")]
        public async Task<IActionResult> GetTrendingTvDaily([FromQuery] int page = 1)
        {
            var data = await _tmdbService.GetTrendingTvDailyAsync(page);
            return Content(data, "application/json");
        }
    }
}
