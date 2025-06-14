using Microsoft.AspNetCore.Mvc;
using backend.Services;
using System.Net.Http;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly TmdbService _tmdbService;

        public MoviesController(TmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetPopularMovies()
        {
            try
            {
                var data = await _tmdbService.GetPopularMoviesAsync();
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingMovies()
        {
            try
            {
                var data = await _tmdbService.GetUpcomingMoviesAsync();
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("top_rated")]
        public async Task<IActionResult> GetTopRatedMovies()
        {
            try
            {
                var data = await _tmdbService.GetTopRatedMoviesAsync();
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("trending/all/week")]
        public async Task<IActionResult> GetTrendingAllWeekly()
        {
            try
            {
                var data = await _tmdbService.GetTrendingAllWeekly();
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}