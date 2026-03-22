using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using backend.Constants;
using backend.Models.Dtos;
using backend.Models.Enums;
using backend.Services;
using backend.Services.Tmdb;
using System.Text.Json.Nodes;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/discover")]
    [EnableRateLimiting("standard")]
    public class DiscoverController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

        public DiscoverController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        [HttpGet("movie")]
        public async Task<IActionResult> GetDiscoverMovie()
        {
            var data = await _tmdbService.GetDiscoverMovieAsync();
            return Content(data, "application/json");
        }

        [HttpGet("tv")]
        public async Task<IActionResult> GetDiscoverTv()
        {
            var data = await _tmdbService.GetDiscoverTvAsync();
            return Content(data, "application/json");
        }

        [HttpGet("by-genre")]
        public async Task<IActionResult> DiscoverByGenre(
            [FromQuery] string mediaType,
            [FromQuery] int genreId,
            [FromQuery] int page = 1,
            [FromQuery] string sortBy = "popularity.desc")
        {
            if (!MediaTypes.IsValid(mediaType))
                return BadRequest("Invalid mediaType. Use 'movie' or 'tv'.");

            var data = await _tmdbService.DiscoverByGenreAsync(mediaType, genreId, page, sortBy);

            // Post-filter Animation (16): remove Japanese-language results so they only appear under Anime (7777)
            if (genreId == CustomGenres.AnimationId)
            {
                data = FilterOutJapanese(data);
            }

            return Content(data, "application/json");
        }

        /// <summary>
        /// Advanced discover endpoint with multiple filter parameters.
        /// Supports filtering by genres, year range, rating, runtime, language, watch providers, and sort order.
        /// </summary>
        [HttpGet("advanced")]
        public async Task<IActionResult> AdvancedDiscover(
            [FromQuery] string mediaType = "movie",
            [FromQuery] int[]? genreIds = null,
            [FromQuery] int? primaryReleaseYearGte = null,
            [FromQuery] int? primaryReleaseYearLte = null,
            [FromQuery] decimal? voteAverageGte = null,
            [FromQuery] int? runtimeGte = null,
            [FromQuery] int? runtimeLte = null,
            [FromQuery] string? language = null,
            [FromQuery] string sortBy = "popularity.desc",
            [FromQuery] int page = 1,
            [FromQuery] int? withWatchProviders = null,
            [FromQuery] string? watchRegion = null)
        {
            if (!MediaTypes.IsValid(mediaType))
                return BadRequest("Invalid mediaType. Use 'movie' or 'tv'.");

            if (page < ValidationLimits.MinPageNumber || page > ValidationLimits.MaxPageNumber)
                return BadRequest($"Page must be between {ValidationLimits.MinPageNumber} and {ValidationLimits.MaxPageNumber}.");

            if (voteAverageGte.HasValue && (voteAverageGte < ValidationLimits.MinVoteAverage || voteAverageGte > ValidationLimits.MaxVoteAverage))
                return BadRequest($"voteAverageGte must be between {ValidationLimits.MinVoteAverage} and {ValidationLimits.MaxVoteAverage}.");

            // Handle Anime (7777) in genre filters
            var hasAnime = genreIds?.Contains(CustomGenres.AnimeId) == true;
            var hasAnimation = genreIds?.Contains(CustomGenres.AnimationId) == true;

            if (hasAnime && genreIds != null)
            {
                genreIds = genreIds.Select(id => id == CustomGenres.AnimeId ? CustomGenres.AnimationId : id).Distinct().ToArray();
                language = CustomGenres.JapaneseLanguage;
            }

            var data = await _tmdbService.AdvancedDiscoverAsync(
                mediaType,
                genreIds,
                primaryReleaseYearGte,
                primaryReleaseYearLte,
                voteAverageGte,
                runtimeGte,
                runtimeLte,
                language,
                sortBy,
                page,
                withWatchProviders,
                watchRegion);

            // Post-filter Animation: remove Japanese results when Animation is selected without Anime
            if (hasAnimation && !hasAnime)
            {
                data = FilterOutJapanese(data);
            }

            // Post-filter by runtime: TMDB's with_runtime filter can be unreliable,
            // so we verify each movie's actual runtime from its detail endpoint.
            if (mediaType == MediaTypes.Movie && (runtimeGte.HasValue || runtimeLte.HasValue))
            {
                var jsonNode = JsonNode.Parse(data);
                var results = jsonNode?["results"]?.AsArray();

                if (results != null && results.Count > 0)
                {
                    var movieIds = results
                        .Select(r => r?["id"]?.GetValue<int>() ?? 0)
                        .Where(id => id > 0)
                        .ToList();

                    var detailTasks = movieIds.Select(id => _tmdbService.GetMovieDetailsTypedAsync(id));
                    var detailsArray = await Task.WhenAll(detailTasks);

                    var runtimeMap = new Dictionary<int, int?>();
                    for (int i = 0; i < movieIds.Count; i++)
                        runtimeMap[movieIds[i]] = detailsArray[i]?.Runtime;

                    for (int i = results.Count - 1; i >= 0; i--)
                    {
                        var movieId = results[i]?["id"]?.GetValue<int>() ?? 0;
                        runtimeMap.TryGetValue(movieId, out var runtime);

                        if (runtime == null || runtime <= 0)
                        {
                            results.RemoveAt(i);
                            continue;
                        }

                        if (runtimeGte.HasValue && runtime < runtimeGte.Value)
                        {
                            results.RemoveAt(i);
                            continue;
                        }

                        if (runtimeLte.HasValue && runtime > runtimeLte.Value)
                        {
                            results.RemoveAt(i);
                            continue;
                        }

                        results[i]!["runtime"] = runtime;
                    }

                    data = jsonNode!.ToJsonString();
                }
            }

            return Content(data, "application/json");
        }

        private static string FilterOutJapanese(string json)
        {
            var jsonNode = JsonNode.Parse(json);
            var results = jsonNode?["results"]?.AsArray();
            if (results == null) return json;

            for (int i = results.Count - 1; i >= 0; i--)
            {
                var lang = results[i]?["original_language"]?.GetValue<string>();
                if (lang == CustomGenres.JapaneseLanguage)
                {
                    results.RemoveAt(i);
                }
            }

            return jsonNode!.ToJsonString();
        }
    }
}
