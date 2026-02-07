using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;


namespace backend.Services
{
    public class ListService
    {
        private readonly AppDbContext _db;
        private readonly ILogger<ListService> _logger;

        // Max thumbnail file size: 2 MB
        public const int MaxThumbnailBytes = 2 * 1024 * 1024;

        public const int MaxListsPerUser = 20;
        public const int MaxItemsPerList = 10_000;

        public ListService(AppDbContext db, ILogger<ListService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<int> GetUserListCountAsync(string userId)
        {
            return await _db.Lists.CountAsync(l => l.UserId == userId);
        }

        public async Task<List<Models.List>> GetUserListsAsync(string userId)
        {
            return await _db.Lists
                .Where(l => l.UserId == userId)
                .Include(l => l.Items)
                .OrderByDescending(l => l.UpdatedAt)
                .ToListAsync();
        }

        public async Task<Models.List?> GetByIdAsync(int id, string userId)
        {
            return await _db.Lists
                .Include(l => l.Items)
                .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);
        }

        public async Task<Models.List> CreateAsync(Models.List list)
        {
            list.CreatedAt = DateTime.UtcNow;
            list.UpdatedAt = DateTime.UtcNow;

            _db.Lists.Add(list);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Created List {Id} for user {UserId}", list.Id, list.UserId);
            return list;
        }

        public async Task<Models.List> UpdateAsync(Models.List list)
        {
            list.UpdatedAt = DateTime.UtcNow;
            _db.Lists.Update(list);
            await _db.SaveChangesAsync();

            return list;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var list = await _db.Lists
                .FirstOrDefaultAsync(l => l.Id == id && l.UserId == userId);

            if (list is null) return false;

            _db.Lists.Remove(list);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Deleted List {Id} for user {UserId}", id, userId);
            return true;
        }

        /// <summary>
        /// Validates an uploaded thumbnail file.
        /// Returns (isValid, errorMessage).
        /// </summary>
        public static (bool IsValid, string? Error) ValidateThumbnail(Stream fileStream, string fileName, long fileSize)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var jpegMagicBytes = new byte[] { 0xFF, 0xD8, 0xFF };
            var pngMagicBytes = new byte[] { 0x89, 0x50, 0x4E, 0x47 };

            if (fileSize > MaxThumbnailBytes)
                return (false, "File size exceeds the maximum limit of 2 MB.");

            if (!allowedExtensions.Any(ext => fileName.EndsWith(ext, StringComparison.OrdinalIgnoreCase)))
                return (false, "Invalid file extension. Only .jpg, .jpeg, and .png are allowed.");

            if (fileStream.Length < 4)
                return (false, "File is too small to be a valid image.");

            var magicBytes = new byte[4];
            fileStream.Read(magicBytes, 0, magicBytes.Length);
            fileStream.Position = 0; // reset so the file can be saved after validation

            if (!magicBytes.Take(3).SequenceEqual(jpegMagicBytes) &&
                !magicBytes.SequenceEqual(pngMagicBytes))
            {
                return (false, "File content does not match the expected image format.");
            }

            return (true, null);
        }

        // validate list name
        public static (bool IsValid, string? Error) ValidateListName(string listName)
        {
            if (string.IsNullOrWhiteSpace(listName))
                return (false, "List name cannot be empty.");

            if (listName.Length > 100)
                return (false, "List name cannot exceed 100 characters.");

            return (true, null);
        }


    }
}
