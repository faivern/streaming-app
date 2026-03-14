using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Services.Tmdb;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/movies")]
    public class GenreController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

        public GenreController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        [HttpGet("genre/movie/list")]
        public async Task<IActionResult> GetMovieGenre()
        {
            var data = await _tmdbService.GetMovieGenreAsync();
            return Content(data, "application/json");
        }

        [HttpGet("genre/tv/list")]
        public async Task<IActionResult> GetTvGenre()
        {
            var data = await _tmdbService.GetTvGenreAsync();
            return Content(data, "application/json");
        }
    }
}
