namespace backend.Services
{
    public interface IListService
    {
        Task<int> GetUserListCountAsync(string userId);
        Task<List<Models.List>> GetUserListsAsync(string userId);
        Task<Models.List?> GetByIdAsync(int id, string userId);
        Task<Models.List> CreateAsync(Models.List list);
        Task<Models.List> UpdateAsync(Models.List list);
        Task<bool> DeleteAsync(int id, string userId);
    }
}
