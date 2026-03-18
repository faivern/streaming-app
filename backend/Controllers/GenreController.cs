using Microsoft.AspNetCore.Mvc;
using backend.Constants;
using backend.Services;
using backend.Services.Tmdb;
using System.Text.Json.Nodes;

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
            var enriched = InjectAnimeGenre(data);
            return Content(enriched, "application/json");
        }

        [HttpGet("genre/tv/list")]
        public async Task<IActionResult> GetTvGenre()
        {
            var data = await _tmdbService.GetTvGenreAsync();
            var enriched = InjectAnimeGenre(data);
            return Content(enriched, "application/json");
        }

        private static string InjectAnimeGenre(string json)
        {
            var node = JsonNode.Parse(json);
            var genres = node?["genres"]?.AsArray();
            if (genres == null) return json;

            genres.Add(new JsonObject
            {
                ["id"] = CustomGenres.AnimeId,
                ["name"] = CustomGenres.AnimeName
            });

            // Sort genres alphabetically by name
            var sorted = genres
                .OrderBy(g => g?["name"]?.GetValue<string>() ?? "")
                .Select(g => g!.DeepClone())
                .ToList();

            genres.Clear();
            foreach (var g in sorted)
                genres.Add(g);

            return node!.ToJsonString();
        }
    }
}
