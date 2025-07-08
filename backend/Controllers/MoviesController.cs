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

        [HttpGet("popularMovie")]
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

        [HttpGet("popularShow")]
        public async Task<IActionResult> GetPopularShows()
        {
            try
            {
                var data = await _tmdbService.GetPopularShowsAsync();
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
        [HttpGet("trending/movie/week")]
        public async Task<IActionResult> GetTrendingMoviesWeekly()
        {
            try
            {
                var data = await _tmdbService.GetTrendingMoviesWeekly();
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("trending/tv/week")]
        public async Task<IActionResult> GetTrendingTvWeekly()
        {
            try
            {
                var data = await _tmdbService.GetTrendingTvWeekly();
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }



        [HttpGet("movie/{movie_id}")]
        public async Task<IActionResult> GetMovieDetails(int movie_id)
        {
            try
            {
                var data = await _tmdbService.GetMovieDetailsAsync(movie_id);
                    return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("tv/{series_id}")]
        public async Task<IActionResult> GetShowDetails(int series_id)
        {
            try
            {
                var data = await _tmdbService.GetShowDetailsAsync(series_id);
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

     
        [HttpGet("movie/{movieId}/videos")]
        public async Task<IActionResult> GetMovieTrailer(int movieId)
        {
            var (name, url) = await _tmdbService.GetMovieTrailerAsync(movieId);

            if (url == null)
                return Ok(new { name = (string?)null, url = (string?)null });

            return Ok(new { name, url });
        }
        
        [HttpGet("movie/{movieId}/videos/raw")]
        public async Task<IActionResult> GetMovieVideosRaw(int movieId)
        {
            var rawJson = await _tmdbService.GetMovieVideosAsync(movieId);
            return Content(rawJson, "application/json");
        }


    }
}