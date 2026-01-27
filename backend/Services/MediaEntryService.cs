using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class MediaEntryService
    {
        private readonly AppDbContext _db;
        private readonly ILogger<MediaEntryService> _logger;

        public const int reviewTxtMax = 5000; // arbitrary limit
        public const double ratingValueMin = 0.0;
        public const double ratingValueMax = 10.0;

        public MediaEntryService(AppDbContext db, ILogger<MediaEntryService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<List<MediaEntry>> GetUserEntriesAsync(string userId)
        {
            return await _db.MediaEntries
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.UpdatedAt)
                .ToListAsync();
        }

        public async Task<MediaEntry?> GetByIdAsync(int id, string userId)
        {
            return await _db.MediaEntries
                .Include(e => e.Review)
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        }

        public async Task<MediaEntry?> GetByTmdbIdAsync(int tmdbId, string mediaType, string userId)
        {
            return await _db.MediaEntries
                .Include(e => e.Review)
                .FirstOrDefaultAsync(e => e.TmdbId == tmdbId
                    && e.MediaType == mediaType
                    && e.UserId == userId);
        }

        public async Task<MediaEntry> CreateAsync(MediaEntry entry)
        {
            entry.CreatedAt = DateTime.UtcNow;
            entry.UpdatedAt = DateTime.UtcNow;

            _db.MediaEntries.Add(entry);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Created MediaEntry {Id} for user {UserId}", entry.Id, entry.UserId);
            return entry;
        }

        public async Task<MediaEntry> UpdateAsync(MediaEntry entry)
        {
            entry.UpdatedAt = DateTime.UtcNow;
            _db.MediaEntries.Update(entry);
            await _db.SaveChangesAsync();

            return entry;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await _db.MediaEntries
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

            if (entry is null) return false;

            _db.MediaEntries.Remove(entry);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Deleted MediaEntry {Id} for user {UserId}", id, userId);
            return true;
        }

        /// <summary>
        /// Calculates the average of all non-null granular ratings for a media entry.
        /// Returns null if no ratings are set.
        /// </summary>
        public static double? CalculateAverageRating(MediaEntry entry)
        {
            double[] ratings = new[]
            {
                entry.RatingActing,
                entry.RatingStory,
                entry.RatingSoundtrack,
                entry.RatingVisuals
            }
            .Where(r => r.HasValue)
            .Select(r => r!.Value)
            .ToArray();

            return ratings.Length > 0 ? Math.Round(ratings.Average(), 1) : null;
        }

        /// <summary>
        /// Validates that all provided ratings are within 0.0–10.0.
        /// Returns list of invalid field names, or empty if valid.
        /// </summary>
        public static List<string> ValidateRatings(MediaEntry entry)
        {
            var invalid = new List<string>();

            ValidateRating(entry.RatingActing, nameof(entry.RatingActing), invalid);
            ValidateRating(entry.RatingStory, nameof(entry.RatingStory), invalid);
            ValidateRating(entry.RatingSoundtrack, nameof(entry.RatingSoundtrack), invalid);
            ValidateRating(entry.RatingVisuals, nameof(entry.RatingVisuals), invalid);

            return invalid;
        }

        private static void ValidateRating(double? value, string fieldName, List<string> invalid)
        {
            if (value.HasValue && (double.IsNaN(value.Value) || double.IsInfinity(value.Value)
                || value.Value < ratingValueMin || value.Value > ratingValueMax))
            {
                invalid.Add(fieldName);
            }
        }

        // validate user's input for review/note text
        public static bool ValidateText(string? text)
        {
            if (string.IsNullOrEmpty(text)) return true;
            if (text.Length > reviewTxtMax) return false;
            return true;
        }


    }
}
