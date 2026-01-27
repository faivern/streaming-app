using backend.Models;
using backend.Models.Dtos;
using backend.Services;
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
        private readonly MediaEntryService _mediaEntryService;

        public MediaEntryController(MediaEntryService mediaEntryService)
        {
            _mediaEntryService = mediaEntryService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

        private static readonly string[] ValidMediaTypes = { "movie", "tv" };

        [HttpGet]
        public async Task<IActionResult> GetUserEntries()
        {
            try
            {
                var entries = await _mediaEntryService.GetUserEntriesAsync(GetUserId());
                return Ok(entries);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var entry = await _mediaEntryService.GetByIdAsync(id, GetUserId());
                if (entry is null) return NotFound();
                return Ok(entry);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpGet("tmdb/{tmdbId}/{mediaType}")]
        public async Task<IActionResult> GetByTmdbId(int tmdbId, string mediaType)
        {
            if (!ValidMediaTypes.Contains(mediaType))
                return BadRequest("MediaType must be 'movie' or 'tv'.");

            try
            {
                var entry = await _mediaEntryService.GetByTmdbIdAsync(tmdbId, mediaType, GetUserId());
                if (entry is null) return NotFound();
                return Ok(entry);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMediaEntryRequest request)
        {
            if (!ValidMediaTypes.Contains(request.MediaType))
                return BadRequest("MediaType must be 'movie' or 'tv'.");

            try
            {
                var entry = new MediaEntry
                {
                    UserId = GetUserId(),
                    TmdbId = request.TmdbId,
                    MediaType = request.MediaType,
                    Title = request.Title,
                    PosterPath = request.PosterPath,
                    BackdropPath = request.BackdropPath,
                    Overview = request.Overview,
                    VoteAverage = request.VoteAverage,
                    Status = request.Status
                };

                var created = await _mediaEntryService.CreateAsync(entry);
                return Ok(created);
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMediaEntryRequest request)
        {
            try
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
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _mediaEntryService.DeleteAsync(id, GetUserId());
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpPut("{id}/review")]
        public async Task<IActionResult> UpsertReview(int id, [FromBody] UpsertReviewRequest request)
        {
            if (!MediaEntryService.ValidateText(request.Content))
                return BadRequest($"Review text cannot exceed {MediaEntryService.reviewTxtMax} characters.");

            try
            {
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
            catch (Exception)
            {
                return StatusCode(500);
            }
        }

        [HttpDelete("{id}/review")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            try
            {
                var entry = await _mediaEntryService.GetByIdAsync(id, GetUserId());
                if (entry is null) return NotFound();
                if (entry.Review is null) return NotFound();

                entry.Review = null;
                await _mediaEntryService.UpdateAsync(entry);
                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500);
            }
        }
    }
}
