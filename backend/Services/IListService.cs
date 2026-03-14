using backend.Models.Entities;

namespace backend.Services
{
    public interface IListService
    {
        Task<int> GetUserListCountAsync(string userId);
        Task<List<Models.Entities.List>> GetUserListsAsync(string userId);
        Task<Models.Entities.List?> GetByIdAsync(int id, string userId);
        Task<Models.Entities.List> CreateAsync(Models.Entities.List list);
        Task<Models.Entities.List> UpdateAsync(Models.Entities.List list);
        Task<bool> DeleteAsync(int id, string userId);
    }
}
