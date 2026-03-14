using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Services.Tmdb;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/movies")]
    public class PersonController : ControllerBase
    {
        private readonly ITmdbService _tmdbService;

        public PersonController(ITmdbService tmdbService)
        {
            _tmdbService = tmdbService;
        }

        [HttpGet("person/{personId}")]
        public async Task<IActionResult> GetPersonDetails(int personId)
        {
            var data = await _tmdbService.GetPersonDetailsAsync(personId);
            return Content(data, "application/json");
        }

        [HttpGet("person/{personId}/combined_credits")]
        public async Task<IActionResult> GetCombinedCredits(int personId)
        {
            var data = await _tmdbService.GetCombinedCreditsAsync(personId);
            return Content(data, "application/json");
        }
    }
}
