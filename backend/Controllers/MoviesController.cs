using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoviesController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

        public MoviesController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        [HttpGet("popularMovie")]
        public async Task<IActionResult> GetPopularMovies()
        {
            var data = await _tmdbService.GetPopularMoviesAsync();
            return Content(data, "application/json");
        }

        [HttpGet("popularShow")]
        public async Task<IActionResult> GetPopularShows()
        {
            var data = await _tmdbService.GetPopularShowsAsync();
            return Content(data, "application/json");
        }

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingMovies()
        {
            var data = await _tmdbService.GetUpcomingMoviesAsync();
            return Content(data, "application/json");
        }

        [HttpGet("upcoming/{mediaType}")]
        public async Task<IActionResult> GetUpcoming(string mediaType)
        {
            if (!MediaTypes.IsValid(mediaType))
                return BadRequest("mediaType must be 'movie' or 'tv'.");

            var data = mediaType == MediaTypes.Movie
                ? await _tmdbService.GetUpcomingMoviesAsync()
                : await _tmdbService.GetUpcomingTvAsync();
            return Content(data, "application/json");
        }

        [HttpGet("top_rated")]
        public async Task<IActionResult> GetTopRatedMovies()
        {
            var data = await _tmdbService.GetTopRatedMoviesAsync();
            return Content(data, "application/json");
        }

        [HttpGet("top_rated/{mediaType}")]
        public async Task<IActionResult> GetTopRated(string mediaType)
        {
            if (!MediaTypes.IsValid(mediaType))
                return BadRequest("mediaType must be 'movie' or 'tv'.");

            var data = mediaType == MediaTypes.Movie
                ? await _tmdbService.GetTopRatedMoviesAsync()
                : await _tmdbService.GetTopRatedTvAsync();
            return Content(data, "application/json");
        }

        [HttpGet("movie/{movieId}")]
        public async Task<IActionResult> GetMovieDetails(int movieId)
        {
            var data = await _tmdbService.GetMovieDetailsAsync(movieId);
            return Content(data, "application/json");
        }

        [HttpGet("tv/{seriesId}")]
        public async Task<IActionResult> GetShowDetails(int seriesId)
        {
            var data = await _tmdbService.GetShowDetailsAsync(seriesId);
            return Content(data, "application/json");
        }

        [HttpGet("{mediaType}/{id:int}/trailer")]
        public async Task<IActionResult> GetTrailer(string mediaType, int id)
        {
            if (!Enum.TryParse<backend.Services.MediaType>(mediaType, true, out var type))
                return BadRequest("mediaType must be 'movie' or 'tv'.");

            var (name, url) = await _tmdbService.GetTrailerAsync(type, id);
            return Ok(new { name, url });
        }

        [HttpGet("{mediaType}/{id:int}/videos/raw")]
        public async Task<IActionResult> GetVideosRaw(string mediaType, int id)
        {
            if (!Enum.TryParse<backend.Services.MediaType>(mediaType, true, out var type))
                return BadRequest("mediaType must be 'movie' or 'tv'.");

            var rawJson = await _tmdbService.GetVideosAsync(type, id);
            return Content(rawJson, "application/json");
        }

        [HttpGet("movie/{movieId}/keywords")]
        public async Task<IActionResult> GetMovieKeywords(int movieId)
        {
            var data = await _tmdbService.GetMovieKeywordsAsync(movieId);
            return Content(data, "application/json");
        }

        [HttpGet("tv/{seriesId}/keywords")]
        public async Task<IActionResult> GetShowKeywords(int seriesId)
        {
            var data = await _tmdbService.GetShowKeywordsAsync(seriesId);
            return Content(data, "application/json");
        }

        [HttpGet("movie/{movieId}/credits")]
        public async Task<IActionResult> GetMovieCredits(int movieId)
        {
            var data = await _tmdbService.GetMovieCreditsAsync(movieId);
            return Content(data, "application/json");
        }

        [HttpGet("tv/{seriesId}/aggregate_credits")]
        public async Task<IActionResult> GetShowCredits(int seriesId)
        {
            var data = await _tmdbService.GetShowCreditsAsync(seriesId);
            return Content(data, "application/json");
        }

        [HttpGet("movie/{movieId}/similar")]
        public async Task<IActionResult> GetSimilarMovies(int movieId)
        {
            var data = await _tmdbService.GetSimilarMoviesAsync(movieId);
            return Content(data, "application/json");
        }

        [HttpGet("tv/{seriesId}/similar")]
        public async Task<IActionResult> GetSimilarShows(int seriesId)
        {
            var data = await _tmdbService.GetSimilarShowsAsync(seriesId);
            return Content(data, "application/json");
        }

        [HttpGet("movie/{movieId}/images")]
        public async Task<IActionResult> GetMovieImages(int movieId)
        {
            var data = await _tmdbService.GetMovieImagesAsync(movieId);
            return Content(data, "application/json");
        }

        [HttpGet("tv/{seriesId}/images")]
        public async Task<IActionResult> GetSeriesImages(int seriesId)
        {
            var data = await _tmdbService.GetSeriesImagesAsync(seriesId);
            return Content(data, "application/json");
        }
    }
}
