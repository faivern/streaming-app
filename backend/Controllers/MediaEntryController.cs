using backend.Models.Entities;
using backend.Models.Enums;
using backend.Models.Dtos;
using backend.Services;
using backend.Services.Tmdb;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/media-entries")]
    [Authorize]
    public class MediaEntryController : ControllerBase
    {
        private readonly IMediaEntryService _mediaEntryService;
        private readonly ITmdbService _tmdbService;

        public MediaEntryController(IMediaEntryService mediaEntryService, ITmdbService tmdbService)
        {
            _mediaEntryService = mediaEntryService;
            _tmdbService = tmdbService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

[HttpGet]
        public async Task<IActionResult> GetUserEntries()
        {
            var entries = await _mediaEntryService.GetUserEntriesAsync(GetUserId());
            return Ok(entries);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entry = await _mediaEntryService.GetByIdAsync(id, GetUserId());
            if (entry is null) return NotFound();
            return Ok(entry);
        }

        [HttpGet("tmdb/{tmdbId}/{mediaType}")]
        public async Task<IActionResult> GetByTmdbId(int tmdbId, string mediaType)
        {
            if (!MediaTypes.IsValid(mediaType))
                return BadRequest("MediaType must be 'movie' or 'tv'.");

            var entry = await _mediaEntryService.GetByTmdbIdAsync(tmdbId, mediaType, GetUserId());
            if (entry is null) return NotFound();
            return Ok(entry);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMediaEntryRequest request)
        {
            if (!MediaTypes.IsValid(request.MediaType))
                return BadRequest("MediaType must be 'movie' or 'tv'.");

            var entry = new MediaEntry
            {
                UserId = GetUserId(),
                TmdbId = request.TmdbId,
                MediaType = request.MediaType,
                Status = request.Status
            };

            // Server-side TMDB fetch
            if (request.MediaType == MediaTypes.Movie)
            {
                var details = await _tmdbService.GetMovieDetailsTypedAsync(request.TmdbId);
                if (details is not null) TmdbFieldMapper.ApplyMovieDetails(entry, details);
            }
            else
            {
                var details = await _tmdbService.GetTvDetailsTypedAsync(request.TmdbId);
                if (details is not null) TmdbFieldMapper.ApplyTvDetails(entry, details);
            }

            var created = await _mediaEntryService.CreateAsync(entry);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMediaEntryRequest request)
        {
            var entry = await _mediaEntryService.GetByIdAsync(id, GetUserId());
            if (entry is null) return NotFound();

            if (request.Status.HasValue) entry.Status = request.Status.Value;
            if (request.RatingActing.HasValue) entry.RatingActing = request.RatingActing;
            if (request.RatingStory.HasValue) entry.RatingStory = request.RatingStory;
            if (request.RatingSoundtrack.HasValue) entry.RatingSoundtrack = request.RatingSoundtrack;
            if (request.RatingVisuals.HasValue) entry.RatingVisuals = request.RatingVisuals;
            if (request.WatchedAt.HasValue) entry.WatchedAt = request.WatchedAt;

            var invalidRatings = MediaEntryService.ValidateRatings(entry);
            if (invalidRatings.Count > 0)
                return BadRequest($"Invalid ratings: {string.Join(", ", invalidRatings)}. Must be 0–10.");

            var updated = await _mediaEntryService.UpdateAsync(entry);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _mediaEntryService.DeleteAsync(id, GetUserId());
            if (!deleted) return NotFound();
            return NoContent();
        }

        [HttpPut("{id}/review")]
        public async Task<IActionResult> UpsertReview(int id, [FromBody] UpsertReviewRequest request)
        {
            if (!MediaEntryService.ValidateText(request.Content))
                return BadRequest($"Review text cannot exceed {MediaEntryService.ReviewTextMax} characters.");

            var entry = await _mediaEntryService.GetByIdAsync(id, GetUserId());
            if (entry is null) return NotFound();

            if (entry.Review is not null)
            {
                entry.Review.Content = request.Content;
                entry.Review.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                entry.Review = new Review
                {
                    MediaEntryId = entry.Id,
                    Content = request.Content
                };
            }

            await _mediaEntryService.UpdateAsync(entry);
            return Ok(entry.Review);
        }

        [HttpDelete("{id}/review")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var entry = await _mediaEntryService.GetByIdAsync(id, GetUserId());
            if (entry is null) return NotFound();
            if (entry.Review is null) return NotFound();

            entry.Review = null;
            await _mediaEntryService.UpdateAsync(entry);
            return NoContent();
        }
    }
}
