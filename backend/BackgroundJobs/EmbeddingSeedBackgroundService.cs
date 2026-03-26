using backend.Services;

namespace backend.BackgroundJobs;

public class EmbeddingSeedBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EmbeddingSeedBackgroundService> _logger;
    private const int StartupDelayMinutes = 5; // D-18: 5-minute startup delay

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

            // D-21: weekly refresh
            await Task.Delay(TimeSpan.FromDays(7), stoppingToken);
        }
    }

    private async Task RunSeedCycleAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var seedService = scope.ServiceProvider.GetRequiredService<IEmbeddingSeedService>();
        await seedService.RunAsync(ct);
    }
}
