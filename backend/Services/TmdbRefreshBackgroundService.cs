using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class TmdbRefreshBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<TmdbRefreshBackgroundService> _logger;
        private static readonly TimeSpan RunInterval = TimeSpan.FromDays(7);
        private static readonly TimeSpan StaleThreshold = TimeSpan.FromDays(7);
        private static readonly TimeSpan ThrottleDelay = TimeSpan.FromMilliseconds(500);

        public TmdbRefreshBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<TmdbRefreshBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Wait a bit after startup before first run
            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await RefreshStaleRecordsAsync(stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during TMDB refresh cycle");
                }

                await Task.Delay(RunInterval, stoppingToken);
            }
        }

        private async Task RefreshStaleRecordsAsync(CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var tmdb = scope.ServiceProvider.GetRequiredService<TmdbService>();

            var cutoff = DateTime.UtcNow - StaleThreshold;

            // Collect unique (TmdbId, MediaType) pairs from both tables
            var staleEntries = await db.MediaEntries
                .Where(e => e.LastTmdbSync == null || e.LastTmdbSync < cutoff)
                .Select(e => new { e.TmdbId, e.MediaType })
                .Distinct()
                .ToListAsync(ct);

            var staleItems = await db.ListItems
                .Where(i => i.LastTmdbSync == null || i.LastTmdbSync < cutoff)
                .Select(i => new { i.TmdbId, i.MediaType })
                .Distinct()
                .ToListAsync(ct);

            var uniqueKeys = staleEntries
                .Concat(staleItems)
                .Select(x => (x.TmdbId, x.MediaType))
                .Distinct()
                .ToList();

            _logger.LogInformation("TMDB refresh: {Count} unique items to refresh", uniqueKeys.Count);

            var refreshed = 0;
            foreach (var (tmdbId, mediaType) in uniqueKeys)
            {
                if (ct.IsCancellationRequested) break;

                try
                {
                    if (mediaType == "movie")
                    {
                        var details = await tmdb.GetMovieDetailsTypedAsync(tmdbId);
                        if (details is not null)
                        {
                            var entries = await db.MediaEntries
                                .Where(e => e.TmdbId == tmdbId && e.MediaType == "movie")
                                .ToListAsync(ct);
                            foreach (var entry in entries)
                                TmdbFieldMapper.ApplyMovieDetails(entry, details);

                            var items = await db.ListItems
                                .Where(i => i.TmdbId == tmdbId && i.MediaType == "movie")
                                .ToListAsync(ct);
                            foreach (var item in items)
                                TmdbFieldMapper.ApplyMovieDetails(item, details);
                        }
                    }
                    else
                    {
                        var details = await tmdb.GetTvDetailsTypedAsync(tmdbId);
                        if (details is not null)
                        {
                            var entries = await db.MediaEntries
                                .Where(e => e.TmdbId == tmdbId && e.MediaType == "tv")
                                .ToListAsync(ct);
                            foreach (var entry in entries)
                                TmdbFieldMapper.ApplyTvDetails(entry, details);

                            var items = await db.ListItems
                                .Where(i => i.TmdbId == tmdbId && i.MediaType == "tv")
                                .ToListAsync(ct);
                            foreach (var item in items)
                                TmdbFieldMapper.ApplyTvDetails(item, details);
                        }
                    }

                    refreshed++;
                    if (refreshed % 50 == 0)
                    {
                        await db.SaveChangesAsync(ct);
                        _logger.LogInformation("TMDB refresh: saved batch at {Count}/{Total}", refreshed, uniqueKeys.Count);
                    }

                    await Task.Delay(ThrottleDelay, ct);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "TMDB refresh failed for {MediaType} {TmdbId}", mediaType, tmdbId);
                }
            }

            await db.SaveChangesAsync(ct);
            _logger.LogInformation("TMDB refresh complete: {Refreshed}/{Total} items updated", refreshed, uniqueKeys.Count);
        }
    }
}
