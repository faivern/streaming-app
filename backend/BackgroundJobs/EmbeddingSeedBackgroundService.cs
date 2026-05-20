using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.BackgroundJobs;

public class EmbeddingSeedBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EmbeddingSeedBackgroundService> _logger;
    private const int StartupDelayMinutes = 5;
    private const int SeedTargetTotal = 15_000;
    private static readonly TimeSpan RetryInterval = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan RefreshInterval = TimeSpan.FromDays(7);

    public EmbeddingSeedBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<EmbeddingSeedBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Embedding seed service starting, waiting {Delay} minutes before first run",
            StartupDelayMinutes);
        await Task.Delay(TimeSpan.FromMinutes(StartupDelayMinutes), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Embedding seed cycle starting");
                await RunSeedCycleAsync(stoppingToken);
                _logger.LogInformation("Embedding seed cycle complete");
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during embedding seed cycle");
            }

            var delay = await IsSeedingComplete(stoppingToken) ? RefreshInterval : RetryInterval;
            _logger.LogInformation("Next seed cycle in {Delay}", delay);
            await Task.Delay(delay, stoppingToken);
        }
    }

    private async Task<bool> IsSeedingComplete(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var count = await db.MovieEmbeddings.CountAsync(ct);
        return count >= SeedTargetTotal;
    }

    private async Task RunSeedCycleAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var seedService = scope.ServiceProvider.GetRequiredService<IEmbeddingSeedService>();
        await seedService.RunAsync(ct);
    }
}
