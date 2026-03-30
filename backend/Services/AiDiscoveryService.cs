using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Azure.AI.OpenAI;
using backend.Data;
using backend.Models.Dtos;
using backend.Models.Entities;
using backend.Models.Enums;
using backend.Models.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using OpenAI.Chat;
using Pgvector;
using Pgvector.EntityFrameworkCore;

namespace backend.Services;

public class AiDiscoveryService : IAiDiscoveryService
{
    private readonly AzureOpenAIClient _aiClient;
    private readonly AzureOpenAIOptions _aiOptions;
    private readonly AppDbContext _db;
    private readonly IMediaEntryService _mediaEntryService;
    private readonly IMemoryCache _cache;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AiDiscoveryService> _logger;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public AiDiscoveryService(
        AzureOpenAIClient aiClient,
        AzureOpenAIOptions aiOptions,
        AppDbContext db,
        IMediaEntryService mediaEntryService,
        IMemoryCache cache,
        IServiceScopeFactory scopeFactory,
        ILogger<AiDiscoveryService> logger)
    {
        _aiClient = aiClient;
        _aiOptions = aiOptions;
        _db = db;
        _mediaEntryService = mediaEntryService;
        _cache = cache;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task<AiDiscoverResponseDto> DiscoverAsync(
        string query,
        string userId,
        CancellationToken cancellationToken = default)
    {
        // Step 0: Cache check (D-15, D-17)
        var cacheKey = BuildCacheKey(userId, query);
        if (_cache.TryGetValue(cacheKey, out AiDiscoverResponseDto? cached) && cached is not null)
        {
            _logger.LogInformation("AI discover cache hit for user {UserId}", userId);
            return cached;
        }

        var stopwatch = Stopwatch.StartNew();

        // Step 1: Embed query (RAG-01)
        Vector queryVector;
        try
        {
            var embeddingClient = _aiClient.GetEmbeddingClient(_aiOptions.EmbeddingDeployment);
            var embeddingResult = await embeddingClient.GenerateEmbeddingAsync(
                query, cancellationToken: cancellationToken);
            var floats = embeddingResult.Value.ToFloats().ToArray();
            queryVector = new Vector(floats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Embedding API failure for user {UserId}", userId);
            throw new AiServiceUnavailableException("AI service temporarily unavailable", ex);
        }

        // Step 2: Vector search — top 20 (RAG-01)
        List<MovieEmbedding> candidates;
        try
        {
            candidates = await _db.MovieEmbeddings
                .OrderBy(e => e.Embedding.CosineDistance(queryVector))
                .Take(20)
                .ToListAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Vector search failure for user {UserId}", userId);
            throw new AiServiceUnavailableException("AI service temporarily unavailable", ex);
        }

        // Step 3: Personalization — filter watched titles (PERS-01, D-07, D-08, D-09)
        var userEntries = await _mediaEntryService.GetUserEntriesAsync(userId);
        var watchedTmdbIds = userEntries
            .Where(e => e.Status == WatchStatus.Watched)
            .Select(e => e.TmdbId)
            .ToHashSet();

        var filtered = candidates.Where(c => !watchedTmdbIds.Contains(c.TmdbId)).ToList();

        // D-10: if all candidates are watched (or no watch history), use all candidates
        if (filtered.Count == 0)
        {
            _logger.LogInformation(
                "All candidates watched or no watch history for user {UserId}, using all candidates",
                userId);
            filtered = candidates;
        }

        // Step 4: LLM call — GPT-4o-mini ranking (RAG-02, D-01, D-04, D-05, D-06, GUARD-02)
        // Take top 10 filtered candidates for the LLM
        var llmCandidates = filtered.Take(10).ToList();

        var candidateLines = llmCandidates.Select(c =>
            string.Format(
                AiDiscoveryPrompts.CandidateItemTemplate,
                c.TmdbId,
                c.MediaType,
                c.Title,
                c.ReleaseYear,
                c.Genres,
                c.Overview));

        var candidateText = string.Join("\n", candidateLines);
        var userMessage = string.Format(AiDiscoveryPrompts.CandidateTemplate, candidateText, query);

        string rawLlmJson;
        int promptTokens = 0;
        int completionTokens = 0;

        try
        {
            var chatClient = _aiClient.GetChatClient(_aiOptions.ChatDeployment);
            var chatOptions = new ChatCompletionOptions
            {
                Temperature = _aiOptions.Temperature,
                MaxOutputTokenCount = _aiOptions.MaxTokens
            };
            var systemPrompt = string.IsNullOrWhiteSpace(_aiOptions.SystemPromptOverride)
                ? AiDiscoveryPrompts.SystemPrompt
                : _aiOptions.SystemPromptOverride;
            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userMessage)
            };

            var chatResult = await chatClient.CompleteChatAsync(messages, chatOptions, cancellationToken);
            rawLlmJson = chatResult.Value.Content[0].Text;
            promptTokens = chatResult.Value.Usage.InputTokenCount;
            completionTokens = chatResult.Value.Usage.OutputTokenCount;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LLM API failure for user {UserId}", userId);
            throw new AiServiceUnavailableException("AI service temporarily unavailable", ex);
        }

        // Step 5: Output validation (RAG-03, D-03, D-13, D-14)
        LlmResponse? llmResponse;
        try
        {
            llmResponse = JsonSerializer.Deserialize<LlmResponse>(rawLlmJson, _jsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse LLM response JSON for user {UserId}: {Json}", userId, rawLlmJson);
            throw new AiServiceUnavailableException("AI service temporarily unavailable", ex);
        }

        if (llmResponse is null)
        {
            _logger.LogError("LLM returned null response for user {UserId}", userId);
            throw new AiServiceUnavailableException("AI service temporarily unavailable");
        }

        // D-02: off-topic query — return empty results with the off-topic message
        if (llmResponse.IsOffTopic)
        {
            stopwatch.Stop();
            var offTopicResponse = new AiDiscoverResponseDto(
                Results: [],
                Message: llmResponse.Message ?? "I can only help with movie and TV recommendations. Please try a different query.",
                ResponseTimeMs: stopwatch.ElapsedMilliseconds);

            FireAndForgetLog(userId, query, offTopicResponse, rawLlmJson, promptTokens, completionTokens);
            return offTopicResponse;
        }

        // Build set of valid candidate TmdbIds for validation (D-03, D-13)
        var validCandidateIds = candidates.Select(c => c.TmdbId).ToHashSet();

        var validResults = (llmResponse.Results ?? [])
            .Where(r => validCandidateIds.Contains(r.TmdbId))
            .Select(r => new AiDiscoverResultDto(
                TmdbId: r.TmdbId,
                MediaType: r.MediaType ?? string.Empty,
                Title: r.Title ?? string.Empty,
                Explanation: r.Explanation ?? string.Empty,
                MatchScore: r.MatchScore))
            .ToList();

        // D-14: zero valid results after validation → 503
        if (validResults.Count == 0)
        {
            _logger.LogWarning(
                "LLM returned zero valid results after validation for user {UserId}. Raw: {Json}",
                userId, rawLlmJson);
            throw new AiServiceUnavailableException("AI service temporarily unavailable");
        }

        // Step 6: Response + Cache + Log (RAG-05, GUARD-03, D-15, D-20, D-21, D-22)
        stopwatch.Stop();
        var response = new AiDiscoverResponseDto(
            Results: validResults,
            Message: llmResponse.Message ?? string.Empty,
            ResponseTimeMs: stopwatch.ElapsedMilliseconds);

        _cache.Set(cacheKey, response, TimeSpan.FromMinutes(30));

        FireAndForgetLog(userId, query, response, rawLlmJson, promptTokens, completionTokens);

        return response;
    }

    // --- Private helpers ---

    private static string BuildCacheKey(string userId, string query)
    {
        var normalized = query.Trim().ToLowerInvariant();
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(normalized));
        var hash = Convert.ToHexString(hashBytes).ToLowerInvariant();
        return $"ai_discover:{userId}:{hash}";
    }

    private const int MaxStoredJsonLength = 10_000;

    private void FireAndForgetLog(
        string userId,
        string query,
        AiDiscoverResponseDto response,
        string rawLlmJson,
        int promptTokens,
        int completionTokens)
    {
        var truncatedJson = rawLlmJson.Length > MaxStoredJsonLength
            ? rawLlmJson[..MaxStoredJsonLength]
            : rawLlmJson;

        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.AiQueryLogs.Add(new AiQueryLog
                {
                    UserId = userId,
                    QueryText = query,
                    ResultTmdbIds = JsonSerializer.Serialize(response.Results.Select(r => r.TmdbId)),
                    ResponseTimeMs = (int)response.ResponseTimeMs,
                    PromptTokens = promptTokens,
                    CompletionTokens = completionTokens,
                    ResponseText = truncatedJson
                });
                await db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log AI query for user {UserId}", userId);
            }
        }).ContinueWith(
            t => _logger.LogError(t.Exception, "Unobserved exception in AI query logging"),
            TaskContinuationOptions.OnlyOnFaulted);
    }

    // Private records for LLM JSON deserialization
    private record LlmResponse(
        [property: JsonPropertyName("results")] List<LlmResult>? Results,
        [property: JsonPropertyName("message")] string? Message,
        [property: JsonPropertyName("isOffTopic")] bool IsOffTopic);

    private record LlmResult(
        [property: JsonPropertyName("tmdbId")] int TmdbId,
        [property: JsonPropertyName("mediaType")] string? MediaType,
        [property: JsonPropertyName("title")] string? Title,
        [property: JsonPropertyName("explanation")] string? Explanation,
        [property: JsonPropertyName("matchScore")] double MatchScore);
}
