using backend.Models.Dtos;

namespace backend.Services;

public interface IAiDiscoveryService
{
    Task<AiDiscoverResponseDto> DiscoverAsync(string query, string userId, CancellationToken cancellationToken = default);
}
