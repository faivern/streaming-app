using Microsoft.AspNetCore.Mvc;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/movies")]
    public class WatchProviderController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

        public WatchProviderController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        [HttpGet("movie/{movieId}/watch/providers")]
        public async Task<IActionResult> GetMovieWatchProviders(int movieId)
        {
            var data = await _tmdbService.GetMovieWatchProvidersAsync(movieId);
            return Content(data, "application/json");
        }

        [HttpGet("tv/{seriesId}/watch/providers")]
        public async Task<IActionResult> GetTvWatchProviders(int seriesId)
        {
            var data = await _tmdbService.GetTvWatchProvidersAsync(seriesId);
            return Content(data, "application/json");
        }

        [HttpGet("watch/providers/regions")]
        public async Task<IActionResult> GetWatchProviderRegions()
        {
            var data = await _tmdbService.GetWatchProviderRegionsAsync();
            return Content(data, "application/json");
        }

        [HttpGet("watch/providers/movie")]
        public async Task<IActionResult> GetMovieWatchProvidersList([FromQuery] string watchRegion = "US")
        {
            var data = await _tmdbService.GetMovieWatchProvidersListAsync(watchRegion);
            return Content(data, "application/json");
        }

        [HttpGet("watch/providers/tv")]
        public async Task<IActionResult> GetTvWatchProvidersList([FromQuery] string watchRegion = "US")
        {
            var data = await _tmdbService.GetTvWatchProvidersListAsync(watchRegion);
            return Content(data, "application/json");
        }
    }
}
