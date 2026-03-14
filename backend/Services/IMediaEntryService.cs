using backend.Models;

namespace backend.Services
{
    public interface IMediaEntryService
    {
        Task<List<MediaEntry>> GetUserEntriesAsync(string userId);
        Task<MediaEntry?> GetByIdAsync(int id, string userId);
        Task<MediaEntry?> GetByTmdbIdAsync(int tmdbId, string mediaType, string userId);
        Task<MediaEntry> CreateAsync(MediaEntry entry);
        Task<MediaEntry> UpdateAsync(MediaEntry entry);
        Task<bool> DeleteAsync(int id, string userId);
    }
}
