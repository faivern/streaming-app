using Azure.AI.OpenAI;
using OpenAI.Embeddings;
using System.ClientModel;
using System.Text.Json;
using backend.Data;
using backend.Models.Entities;
using backend.Models.Options;
using backend.Models.Tmdb;
using backend.Services.Tmdb;
using Microsoft.EntityFrameworkCore;
using Pgvector;

namespace backend.Services;

public class EmbeddingSeedService : IEmbeddingSeedService
{
    private readonly AppDbContext _db;
    private readonly ITmdbService _tmdbService;
    private readonly AzureOpenAIClient _azureClient;
    private readonly AzureOpenAIOptions _options;
    private readonly ILogger<EmbeddingSeedService> _logger;

    private const int MovieTarget = 10_000;
    private const int TvTarget = 5_000;
    private const int TotalTarget = 15_000;
    private const int MaxMoviePages = 500;   // D-07: 20/page * 500 = 10,000
    private const int MaxTvPages = 250;      // D-08: 20/page * 250 = 5,000
    private const int BatchSize = 50;        // D-12
    private const int ThrottleDelayMs = 250; // TMDB throttle
    private const int TitlesPerPage = 20;

    public EmbeddingSeedService(
        AppDbContext db,
        ITmdbService tmdbService,
        AzureOpenAIClient azureClient,
        AzureOpenAIOptions options,
        ILogger<EmbeddingSeedService> logger)
    {
        _db = db;
        _tmdbService = tmdbService;
        _azureClient = azureClient;
        _options = options;
        _logger = logger;
    }

    public async Task RunAsync(CancellationToken ct)
    {
        // D-20: checkpoint resume via DB row counts
        var movieCount = await _db.MovieEmbeddings.CountAsync(e => e.MediaType == "movie", ct);
        var tvCount = await _db.MovieEmbeddings.CountAsync(e => e.MediaType == "tv", ct);

        // D-19: skip seed entirely when row count >= 15,000
        if (movieCount + tvCount >= TotalTarget)
        {
            _logger.LogInformation("Seed complete, {MovieCount} movies + {TvCount} TV shows — skipping",
                movieCount, tvCount);
            return;
        }

        var embeddingClient = _azureClient.GetEmbeddingClient(_options.EmbeddingDeployment);

        // D-09: movies first
        if (movieCount < MovieTarget)
        {
            await SeedMediaTypeAsync("movie", movieCount, MaxMoviePages, embeddingClient, ct);
        }

        if (!ct.IsCancellationRequested && tvCount < TvTarget)
        {
            // Re-read TV count in case service was restarted
            tvCount = await _db.MovieEmbeddings.CountAsync(e => e.MediaType == "tv", ct);
            await SeedMediaTypeAsync("tv", tvCount, MaxTvPages, embeddingClient, ct);
        }

        var finalMovieCount = await _db.MovieEmbeddings.CountAsync(e => e.MediaType == "movie", ct);
        var finalTvCount = await _db.MovieEmbeddings.CountAsync(e => e.MediaType == "tv", ct);
        _logger.LogInformation("Seed run complete: {MovieCount} movies + {TvCount} TV shows = {Total} total",
            finalMovieCount, finalTvCount, finalMovieCount + finalTvCount);
    }

    private async Task SeedMediaTypeAsync(
        string mediaType,
        int existingCount,
        int maxPages,
        EmbeddingClient embeddingClient,
        CancellationToken ct)
    {
        // D-20: calculate resume page from existing count
        int startPage = (existingCount / TitlesPerPage) + 1;
        _logger.LogInformation("Starting {MediaType} seed from page {StartPage} ({ExistingCount} existing)",
            mediaType, startPage, existingCount);

        var batch = new List<(int TmdbId, string ContentText, MovieEmbedding Entity)>(BatchSize);
        var processedCount = 0;

        for (int page = startPage; page <= maxPages && !ct.IsCancellationRequested; page++)
        {
            string pageJson;
            try
            {
                pageJson = mediaType == "movie"
                    ? await _tmdbService.GetPopularMoviesPageAsync(page)
                    : await _tmdbService.GetPopularTvPageAsync(page);
            }
            catch (Exception ex) when (!ct.IsCancellationRequested)
            {
                _logger.LogWarning(ex, "Failed to fetch {MediaType} page {Page}, skipping", mediaType, page);
                continue;
            }

            // Parse TMDB IDs from page JSON
            List<int> ids;
            try
            {
                using var doc = JsonDocument.Parse(pageJson);
                ids = doc.RootElement
                    .GetProperty("results")
                    .EnumerateArray()
                    .Select(el => el.GetProperty("id").GetInt32())
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse {MediaType} page {Page} results, skipping", mediaType, page);
                continue;
            }

            foreach (var id in ids)
            {
                if (ct.IsCancellationRequested) break;

                try
                {
                    // Fetch detail with append_to_response=keywords,credits
                    if (mediaType == "movie")
                    {
                        var detail = await _tmdbService.GetMovieDetailsForSeedTypedAsync(id);

                        // D-11: skip if missing overview and genres
                        if (detail is null ||
                            (string.IsNullOrEmpty(detail.Overview) && (detail.Genres == null || detail.Genres.Count == 0)))
                        {
                            _logger.LogWarning("Skipping {MediaType} {Id}: missing overview and genres", mediaType, id);
                            continue;
                        }

                        var contentText = EmbeddingContentBuilder.BuildMovieText(detail);
                        var entity = BuildMovieEmbedding(id, mediaType, detail, contentText);
                        batch.Add((id, contentText, entity));
                    }
                    else
                    {
                        var detail = await _tmdbService.GetTvDetailsForSeedTypedAsync(id);

                        // D-11: skip if missing overview and genres
                        if (detail is null ||
                            (string.IsNullOrEmpty(detail.Overview) && (detail.Genres == null || detail.Genres.Count == 0)))
                        {
                            _logger.LogWarning("Skipping {MediaType} {Id}: missing overview and genres", mediaType, id);
                            continue;
                        }

                        var contentText = EmbeddingContentBuilder.BuildTvText(detail);
                        var entity = BuildTvEmbedding(id, mediaType, detail, contentText);
                        batch.Add((id, contentText, entity));
                    }

                    processedCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to process {MediaType} {Id}, skipping", mediaType, id);
                }

                // TMDB throttle
                await Task.Delay(ThrottleDelayMs, ct);
            }

            if (batch.Count >= BatchSize)
            {
                await EmbedAndUpsertBatchAsync(batch, embeddingClient, ct);
                batch.Clear();
            }

            // Progress every 10 pages
            if (page % 10 == 0)
            {
                _logger.LogInformation("Seed {MediaType}: page {Page}/{MaxPages}, ~{Total} total",
                    mediaType, page, maxPages, existingCount + processedCount);
            }
        }

        // Flush remaining batch
        if (batch.Count > 0)
        {
            await EmbedAndUpsertBatchAsync(batch, embeddingClient, ct);
            batch.Clear();
        }

        _logger.LogInformation("Seed {MediaType} complete", mediaType);
    }

    private static MovieEmbedding BuildMovieEmbedding(int tmdbId, string mediaType, TmdbMovieDetails detail, string contentText)
    {
        var genres = detail.Genres?.Select(g => g.Name).Where(n => !string.IsNullOrEmpty(n)).ToList();
        var keywords = detail.Keywords?.Keywords?.Select(k => k.Name).Where(n => !string.IsNullOrEmpty(n)).ToList();
        var cast = detail.Credits?.Cast?.OrderBy(c => c.Order).Take(5).Select(c => c.Name).Where(n => !string.IsNullOrEmpty(n)).ToList();
        var crew = detail.Credits?.Crew?.Where(c => c.Job == "Director").Select(c => c.Name).Where(n => !string.IsNullOrEmpty(n)).ToList();
        var allCastCrew = (cast ?? new List<string?>()).Concat(crew ?? new List<string?>()).ToList();

        int? releaseYear = null;
        if (detail.ReleaseDate?.Length >= 4 && int.TryParse(detail.ReleaseDate[..4], out var yr))
            releaseYear = yr;

        return new MovieEmbedding
        {
            TmdbId = tmdbId,
            MediaType = mediaType,
            Title = detail.Title,
            Overview = detail.Overview,
            Genres = genres?.Count > 0 ? string.Join(", ", genres) : null,
            Keywords = keywords?.Count > 0 ? string.Join(", ", keywords) : null,
            CastCrew = allCastCrew.Count > 0 ? string.Join(", ", allCastCrew) : null,
            ReleaseYear = releaseYear,
            VoteAverage = detail.VoteAverage,
            ContentText = contentText,
        };
    }

    private static MovieEmbedding BuildTvEmbedding(int tmdbId, string mediaType, TmdbTvDetails detail, string contentText)
    {
        var genres = detail.Genres?.Select(g => g.Name).Where(n => !string.IsNullOrEmpty(n)).ToList();
        // TV keywords use Results property (TMDB API inconsistency — Pitfall 1)
        var keywords = detail.Keywords?.Results?.Select(k => k.Name).Where(n => !string.IsNullOrEmpty(n)).ToList();
        var cast = detail.Credits?.Cast?.OrderBy(c => c.Order).Take(5).Select(c => c.Name).Where(n => !string.IsNullOrEmpty(n)).ToList();
        var creators = detail.CreatedBy?.Select(c => c.Name).Where(n => !string.IsNullOrEmpty(n)).ToList();
        var allCastCrew = (cast ?? new List<string?>()).Concat(creators ?? new List<string?>()).ToList();

        int? releaseYear = null;
        if (detail.FirstAirDate?.Length >= 4 && int.TryParse(detail.FirstAirDate[..4], out var yr))
            releaseYear = yr;

        return new MovieEmbedding
        {
            TmdbId = tmdbId,
            MediaType = mediaType,
            Title = detail.Name,
            Overview = detail.Overview,
            Genres = genres?.Count > 0 ? string.Join(", ", genres) : null,
            Keywords = keywords?.Count > 0 ? string.Join(", ", keywords) : null,
            CastCrew = allCastCrew.Count > 0 ? string.Join(", ", allCastCrew) : null,
            ReleaseYear = releaseYear,
            VoteAverage = detail.VoteAverage,
            ContentText = contentText,
        };
    }

    private async Task EmbedAndUpsertBatchAsync(
        List<(int TmdbId, string ContentText, MovieEmbedding Entity)> batch,
        EmbeddingClient embeddingClient,
        CancellationToken ct)
    {
        var inputs = batch.Select(b => b.ContentText).ToList();

        try
        {
            ClientResult<OpenAIEmbeddingCollection> result =
                await embeddingClient.GenerateEmbeddingsAsync(inputs, cancellationToken: ct);

            // Pitfall 3: validate count matches
            if (result.Value.Count != batch.Count)
            {
                _logger.LogWarning(
                    "Embedding count mismatch: expected {Expected}, got {Actual} — skipping batch",
                    batch.Count, result.Value.Count);
                return;
            }

            for (int i = 0; i < batch.Count; i++)
            {
                ReadOnlyMemory<float> floats = result.Value[i].ToFloats();
                batch[i].Entity.Embedding = new Pgvector.Vector(floats.ToArray());

                var existing = await _db.MovieEmbeddings
                    .FirstOrDefaultAsync(
                        e => e.TmdbId == batch[i].TmdbId && e.MediaType == batch[i].Entity.MediaType,
                        ct);

                if (existing is not null)
                {
                    existing.ContentText = batch[i].Entity.ContentText;
                    existing.Embedding = batch[i].Entity.Embedding;
                    existing.UpdatedAt = DateTime.UtcNow;
                    existing.Title = batch[i].Entity.Title;
                    existing.Overview = batch[i].Entity.Overview;
                    existing.Genres = batch[i].Entity.Genres;
                    existing.Keywords = batch[i].Entity.Keywords;
                    existing.CastCrew = batch[i].Entity.CastCrew;
                    existing.ReleaseYear = batch[i].Entity.ReleaseYear;
                    existing.VoteAverage = batch[i].Entity.VoteAverage;
                }
                else
                {
                    _db.MovieEmbeddings.Add(batch[i].Entity);
                }
            }

            await _db.SaveChangesAsync(ct);
            _logger.LogInformation("Embedded batch of {Count} {MediaType} titles",
                batch.Count, batch[0].Entity.MediaType);
        }
        catch (Azure.RequestFailedException ex) when (ex.Status == 429)
        {
            // D-13, D-14: 429 rate limit — log and skip, do not crash
            _logger.LogError("429 rate limit exhausted after SDK retries for batch of {Count} {MediaType}",
                batch.Count, batch.Count > 0 ? batch[0].Entity.MediaType : "unknown");
        }
        catch (Azure.RequestFailedException ex)
        {
            _logger.LogError("Azure OpenAI error {Status} for batch of {Count}",
                ex.Status, batch.Count);
        }
        catch (OperationCanceledException)
        {
            throw; // Let cancellation propagate
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error embedding batch of {Count}", batch.Count);
        }
    }
}
