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

        [HttpGet("trending/all/day")]
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
        [HttpGet("trending/movie/day")]
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

        [HttpGet("trending/tv/day")]
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


        // keywords fetch for movie and tv
        [HttpGet("movie/{movieId}/keywords")]
        public async Task<IActionResult> GetMovieKeywords(int movieId)
        {
            try
            {
                var data = await _tmdbService.GetMovieKeywordsAsync(movieId);
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [HttpGet("tv/{seriesId}/keywords")]
        public async Task<IActionResult> GetShowKeywords(int seriesId)
        {
            try
            {
                var data = await _tmdbService.GetShowKeywordsAsync(seriesId);
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // credits for movie and show
        [HttpGet("movie/{movieId}/credits")]
        public async Task<IActionResult> GetMovieCredits(int movieId)
        {
            try
            {
                var data = await _tmdbService.GetMovieCreditsAsync(movieId);
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
        [HttpGet("tv/{seriesId}/aggregate_credits")]
        public async Task<IActionResult> GetShowCredits(int seriesId)
        {
            try
            {
                var data = await _tmdbService.GetShowCreditsAsync(seriesId);
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        // similar movies and shows
        [HttpGet("movie/{movieId}/similar")]
        public async Task<IActionResult> GetSimilarMovies(int movieId)
        {
            try
            {
                var data = await _tmdbService.GetSimilarMoviesAsync(movieId);
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
        [HttpGet("tv/{seriesId}/similar")]
        public async Task<IActionResult> GetSimilarShows(int seriesId)
        {
            try
            {
                var data = await _tmdbService.GetSimilarShowsAsync(seriesId);
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        //Person details
        [HttpGet("person/{person_id}")]
        public async Task<IActionResult> GetPersonDetails(int person_id)
        {
            try
            {
                var data = await _tmdbService.GetPersonDetails(person_id);
                return Content(data, "application/json");
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }


        }
    }
}