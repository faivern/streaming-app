using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Services.Tmdb;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/movies")]
    public class CollectionController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

        public CollectionController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        [HttpGet("search/collection")]
        public async Task<IActionResult> SearchCollections([FromQuery] string q, [FromQuery] int page = 1,
            [FromQuery] string language = "en-US")
        {
            if (string.IsNullOrWhiteSpace(q)) return BadRequest("query (q) is required");
            var data = await _tmdbService.SearchCollectionsAsync(q, page, language);
            return Content(data, "application/json");
        }

        [HttpGet("collection/{id:int}")]
        public async Task<IActionResult> GetCollectionById(int id, [FromQuery] string language = "en-US")
        {
            var data = await _tmdbService.GetCollectionByIdAsync(id, language);
            return Content(data, "application/json");
        }
    }
}
