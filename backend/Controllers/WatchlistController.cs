using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/watchlist")]
    [Authorize]
    public class WatchlistController : ControllerBase
    {
        private readonly AppDbContext _db;

        public WatchlistController(AppDbContext db)
        {
            _db = db;
        }

        private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

        // GET /api/watchlist
        [HttpGet]
        public async Task<IActionResult> GetWatchlist()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var items = await _db.WatchlistItems
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.AddedAt)
                .Select(w => new
                {
                    w.Id,
                    w.TmdbId,
                    w.MediaType,
                    w.Title,
                    w.PosterPath,
                    w.AddedAt
                })
                .ToListAsync();

            return Ok(items);
        }

        // POST /api/watchlist
        [HttpPost]
        public async Task<IActionResult> AddToWatchlist([FromBody] AddWatchlistRequest request)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            // Check if already exists
            var exists = await _db.WatchlistItems
                .AnyAsync(w => w.UserId == userId && w.TmdbId == request.TmdbId && w.MediaType == request.MediaType);

            if (exists)
                return Conflict(new { message = "Item already in watchlist" });

            var item = new WatchlistItem
            {
                UserId = userId,
                TmdbId = request.TmdbId,
                MediaType = request.MediaType,
                Title = request.Title,
                PosterPath = request.PosterPath,
                AddedAt = DateTime.UtcNow
            };

            _db.WatchlistItems.Add(item);
            await _db.SaveChangesAsync();

            return Created($"/api/watchlist/{item.Id}", new
            {
                item.Id,
                item.TmdbId,
                item.MediaType,
                item.Title,
                item.PosterPath,
                item.AddedAt
            });
        }

        // DELETE /api/watchlist/{tmdbId}/{mediaType}
        [HttpDelete("{tmdbId}/{mediaType}")]
        public async Task<IActionResult> RemoveFromWatchlist(int tmdbId, string mediaType)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var item = await _db.WatchlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.TmdbId == tmdbId && w.MediaType == mediaType);

            if (item == null)
                return NotFound(new { message = "Item not found in watchlist" });

            _db.WatchlistItems.Remove(item);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        // GET /api/watchlist/check/{tmdbId}/{mediaType}
        [HttpGet("check/{tmdbId}/{mediaType}")]
        public async Task<IActionResult> CheckInWatchlist(int tmdbId, string mediaType)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var exists = await _db.WatchlistItems
                .AnyAsync(w => w.UserId == userId && w.TmdbId == tmdbId && w.MediaType == mediaType);

            return Ok(new { inWatchlist = exists });
        }
    }

    public class AddWatchlistRequest
    {
        public int TmdbId { get; set; }
        public string MediaType { get; set; } = null!;
        public string? Title { get; set; }
        public string? PosterPath { get; set; }
    }
}
