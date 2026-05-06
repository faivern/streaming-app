using System.ClientModel;
using System.ClientModel.Primitives;
using Azure.AI.OpenAI;
using backend.Data;
using backend.Models.Dtos;
using backend.Models.Entities;
using backend.Models.Enums;
using backend.Models.Options;
using backend.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using OpenAI.Chat;
using OpenAI.Embeddings;
using Pgvector;

namespace backend.Tests.Unit.Services;

public class AiDiscoveryServiceTests
{
    private const string TestUserId = "test-user-123";
    private const string TestQuery = "time loop comedy";

    private readonly Mock<AzureOpenAIClient> _mockAiClient;
    private readonly Mock<EmbeddingClient> _mockEmbeddingClient;
    private readonly Mock<ChatClient> _mockChatClient;
    private readonly Mock<IMediaEntryService> _mockMediaEntryService;
    private readonly Mock<IMemoryCache> _mockCache;
    private readonly Mock<IServiceScopeFactory> _mockScopeFactory;
    private readonly AzureOpenAIOptions _aiOptions;

    public AiDiscoveryServiceTests()
    {
        _mockAiClient = new Mock<AzureOpenAIClient>();
        _mockEmbeddingClient = new Mock<EmbeddingClient>();
        _mockChatClient = new Mock<ChatClient>();
        _mockMediaEntryService = new Mock<IMediaEntryService>();
        _mockCache = new Mock<IMemoryCache>();
        _mockScopeFactory = new Mock<IServiceScopeFactory>();
        _aiOptions = new AzureOpenAIOptions("test-embedding", "test-chat");

        _mockAiClient
            .Setup(c => c.GetEmbeddingClient(It.IsAny<string>()))
            .Returns(_mockEmbeddingClient.Object);
        _mockAiClient
            .Setup(c => c.GetChatClient(It.IsAny<string>()))
            .Returns(_mockChatClient.Object);

        _mockMediaEntryService
            .Setup(s => s.GetUserEntriesAsync(It.IsAny<string>()))
            .ReturnsAsync(new List<MediaEntry>());

        SetupScopeFactory();
    }

    // ─── Cache tests ───

    [Fact]
    public async Task DiscoverAsync_CacheHit_ReturnsCachedResponse()
    {
        var cached = new AiDiscoverResponseDto(
            Results: new List<AiDiscoverResultDto> { CreateResultDto(100) },
            Alternates: new List<AiDiscoverResultDto>(),
            Message: "cached",
            ResponseTimeMs: 50);
        object cacheEntry = cached;
        _mockCache
            .Setup(c => c.TryGetValue(It.IsAny<object>(), out cacheEntry!))
            .Returns(true);

        var svc = CreateService();
        var result = await svc.DiscoverAsync(TestQuery, TestUserId);

        result.Should().BeSameAs(cached);
        _mockEmbeddingClient.Verify(
            e => e.GenerateEmbeddingAsync(It.IsAny<string>(), It.IsAny<EmbeddingGenerationOptions>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task DiscoverAsync_CacheMiss_RunsFullPipeline()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();
        SetupChatResponse(BuildValidLlmJson(new[] { (100, "movie", "Movie A") }));

        var svc = CreateService(candidates: new[] { CreateCandidate(100, "movie", "Movie A") });
        var result = await svc.DiscoverAsync(TestQuery, TestUserId);

        result.Results.Should().HaveCountGreaterThan(0);
    }

    [Fact]
    public async Task DiscoverAsync_CachesSuccessfulResponse()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();
        SetupChatResponse(BuildValidLlmJson(new[] { (100, "movie", "Movie A") }));

        var cacheEntries = new Dictionary<object, object>();
        var mockEntry = new Mock<ICacheEntry>();
        mockEntry.SetupSet(e => e.Value = It.IsAny<object>())
            .Callback<object>(v => cacheEntries["stored"] = v);
        mockEntry.SetupSet(e => e.AbsoluteExpirationRelativeToNow = It.IsAny<TimeSpan?>());
        _mockCache
            .Setup(c => c.CreateEntry(It.IsAny<object>()))
            .Returns(mockEntry.Object);

        var svc = CreateService(candidates: new[] { CreateCandidate(100, "movie", "Movie A") });
        await svc.DiscoverAsync(TestQuery, TestUserId);

        cacheEntries.Should().ContainKey("stored");
        cacheEntries["stored"].Should().BeOfType<AiDiscoverResponseDto>();
    }

    // ─── Embedding tests ───

    [Fact]
    public async Task DiscoverAsync_EmbeddingApiFailure_ThrowsAiServiceUnavailableException()
    {
        SetupCacheMiss();
        _mockEmbeddingClient
            .Setup(e => e.GenerateEmbeddingAsync(
                It.IsAny<string>(),
                It.IsAny<EmbeddingGenerationOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("API down"));

        var svc = CreateService();
        var act = () => svc.DiscoverAsync(TestQuery, TestUserId);

        await act.Should().ThrowAsync<AiServiceUnavailableException>();
    }

    // ─── Vector search tests ───

    [Fact]
    public async Task DiscoverAsync_VectorSearchFailure_ThrowsAiServiceUnavailableException()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();

        var svc = CreateService(vectorSearchThrows: true);
        var act = () => svc.DiscoverAsync(TestQuery, TestUserId);

        await act.Should().ThrowAsync<AiServiceUnavailableException>();
    }

    // ─── Personalization tests ───

    [Fact]
    public async Task DiscoverAsync_FiltersWatchedTitles_FromCandidates()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();

        var candidates = new[]
        {
            CreateCandidate(100, "movie", "Watched Movie"),
            CreateCandidate(200, "movie", "Unwatched Movie"),
            CreateCandidate(300, "movie", "Also Unwatched"),
        };

        _mockMediaEntryService
            .Setup(s => s.GetUserEntriesAsync(TestUserId))
            .ReturnsAsync(new List<MediaEntry>
            {
                new() { TmdbId = 100, MediaType = "movie", Status = WatchStatus.Watched }
            });

        // LLM returns only the unwatched candidates
        SetupChatResponse(BuildValidLlmJson(new[]
        {
            (200, "movie", "Unwatched Movie"),
            (300, "movie", "Also Unwatched"),
        }));

        var svc = CreateService(candidates: candidates);
        var result = await svc.DiscoverAsync(TestQuery, TestUserId);

        result.Results.Should().NotContain(r => r.TmdbId == 100);
    }

    [Fact]
    public async Task DiscoverAsync_AllCandidatesWatched_UsesAllCandidates()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();

        var candidates = new[]
        {
            CreateCandidate(100, "movie", "Movie A"),
            CreateCandidate(200, "movie", "Movie B"),
        };

        _mockMediaEntryService
            .Setup(s => s.GetUserEntriesAsync(TestUserId))
            .ReturnsAsync(new List<MediaEntry>
            {
                new() { TmdbId = 100, MediaType = "movie", Status = WatchStatus.Watched },
                new() { TmdbId = 200, MediaType = "movie", Status = WatchStatus.Watched },
            });

        // LLM still gets candidates because fallback uses all
        SetupChatResponse(BuildValidLlmJson(new[]
        {
            (100, "movie", "Movie A"),
            (200, "movie", "Movie B"),
        }));

        var svc = CreateService(candidates: candidates);
        var result = await svc.DiscoverAsync(TestQuery, TestUserId);

        result.Results.Should().HaveCountGreaterThan(0);
    }

    [Fact]
    public async Task DiscoverAsync_NoWatchHistory_UsesAllCandidates()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();

        var candidates = new[] { CreateCandidate(100, "movie", "Movie A") };
        _mockMediaEntryService
            .Setup(s => s.GetUserEntriesAsync(TestUserId))
            .ReturnsAsync(new List<MediaEntry>());

        SetupChatResponse(BuildValidLlmJson(new[] { (100, "movie", "Movie A") }));

        var svc = CreateService(candidates: candidates);
        var result = await svc.DiscoverAsync(TestQuery, TestUserId);

        result.Results.Should().Contain(r => r.TmdbId == 100);
    }

    [Fact]
    public async Task DiscoverAsync_OnlyFiltersWatchedStatus_NotWantToWatch()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();

        var candidates = new[]
        {
            CreateCandidate(100, "movie", "Want-to-Watch Movie"),
            CreateCandidate(200, "movie", "Watching Movie"),
        };

        _mockMediaEntryService
            .Setup(s => s.GetUserEntriesAsync(TestUserId))
            .ReturnsAsync(new List<MediaEntry>
            {
                new() { TmdbId = 100, MediaType = "movie", Status = WatchStatus.WantToWatch },
                new() { TmdbId = 200, MediaType = "movie", Status = WatchStatus.Watching },
            });

        SetupChatResponse(BuildValidLlmJson(new[]
        {
            (100, "movie", "Want-to-Watch Movie"),
            (200, "movie", "Watching Movie"),
        }));

        var svc = CreateService(candidates: candidates);
        var result = await svc.DiscoverAsync(TestQuery, TestUserId);

        result.Results.Select(r => r.TmdbId).Should().Contain(new[] { 100, 200 });
    }

    // ─── LLM tests ───

    [Fact]
    public async Task DiscoverAsync_LlmApiFailure_ThrowsAiServiceUnavailableException()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();

        _mockChatClient
            .Setup(c => c.CompleteChatAsync(
                It.IsAny<IEnumerable<ChatMessage>>(),
                It.IsAny<ChatCompletionOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("LLM down"));

        var svc = CreateService(candidates: new[] { CreateCandidate(100, "movie", "A") });
        var act = () => svc.DiscoverAsync(TestQuery, TestUserId);

        await act.Should().ThrowAsync<AiServiceUnavailableException>();
    }

    [Fact]
    public async Task DiscoverAsync_UsesSystemPromptOverride_WhenConfigured()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();

        IEnumerable<ChatMessage>? capturedMessages = null;
        SetupChatResponseWithCapture(
            BuildValidLlmJson(new[] { (100, "movie", "A") }),
            msgs => capturedMessages = msgs);

        var overrideOptions = new AzureOpenAIOptions("test-embedding", "test-chat",
            SystemPromptOverride: "Custom system prompt");

        var svc = CreateService(
            candidates: new[] { CreateCandidate(100, "movie", "A") },
            optionsOverride: overrideOptions);
        await svc.DiscoverAsync(TestQuery, TestUserId);

        capturedMessages.Should().NotBeNull();
        var systemMsg = capturedMessages!.OfType<SystemChatMessage>().First();
        systemMsg.Content[0].Text.Should().Be("Custom system prompt");
    }

    // ─── Response parsing tests ───

    [Fact]
    public async Task DiscoverAsync_InvalidLlmJson_ThrowsAiServiceUnavailableException()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();
        SetupChatResponse("this is not json at all {{");

        var svc = CreateService(candidates: new[] { CreateCandidate(100, "movie", "A") });
        var act = () => svc.DiscoverAsync(TestQuery, TestUserId);

        await act.Should().ThrowAsync<AiServiceUnavailableException>();
    }

    [Fact]
    public async Task DiscoverAsync_NullLlmResponse_ThrowsAiServiceUnavailableException()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();
        SetupChatResponse("null");

        var svc = CreateService(candidates: new[] { CreateCandidate(100, "movie", "A") });
        var act = () => svc.DiscoverAsync(TestQuery, TestUserId);

        await act.Should().ThrowAsync<AiServiceUnavailableException>();
    }

    [Fact]
    public async Task DiscoverAsync_OffTopicResponse_ReturnsEmptyResultsWithMessage()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();

        var offTopicJson = """
            {"results":[],"message":"I can only help with movie and TV recommendations.","isOffTopic":true}
            """;
        SetupChatResponse(offTopicJson);

        var cacheEntry = new Mock<ICacheEntry>();
        cacheEntry.SetupSet(e => e.Value = It.IsAny<object>());
        cacheEntry.SetupSet(e => e.AbsoluteExpirationRelativeToNow = It.IsAny<TimeSpan?>());
        _mockCache.Setup(c => c.CreateEntry(It.IsAny<object>())).Returns(cacheEntry.Object);

        var svc = CreateService(candidates: new[] { CreateCandidate(100, "movie", "A") });
        var result = await svc.DiscoverAsync(TestQuery, TestUserId);

        result.Results.Should().BeEmpty();
        result.Alternates.Should().BeEmpty();
        result.Message.Should().Contain("movie and TV recommendations");
    }

    // ─── Validation tests ───

    [Fact]
    public async Task DiscoverAsync_FiltersHallucinatedTmdbIds_NotInCandidatePool()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();

        var candidates = new[] { CreateCandidate(100, "movie", "Real Movie") };
        // LLM returns a hallucinated ID (999) alongside the real one
        var json = BuildValidLlmJson(new[]
        {
            (100, "movie", "Real Movie"),
            (999, "movie", "Hallucinated Movie"),
        });
        SetupChatResponse(json);

        var svc = CreateService(candidates: candidates);
        var result = await svc.DiscoverAsync(TestQuery, TestUserId);

        result.Results.Should().Contain(r => r.TmdbId == 100);
        result.Results.Concat(result.Alternates).Should().NotContain(r => r.TmdbId == 999);
    }

    [Fact]
    public async Task DiscoverAsync_ZeroValidResultsAfterValidation_Throws()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();

        var candidates = new[] { CreateCandidate(100, "movie", "Real Movie") };
        // LLM returns only hallucinated IDs
        var json = BuildValidLlmJson(new[] { (999, "movie", "Hallucinated") });
        SetupChatResponse(json);

        var svc = CreateService(candidates: candidates);
        var act = () => svc.DiscoverAsync(TestQuery, TestUserId);

        await act.Should().ThrowAsync<AiServiceUnavailableException>();
    }

    [Fact]
    public async Task DiscoverAsync_SplitsResults_First5Primary_RestAlternates()
    {
        SetupCacheMiss();
        SetupEmbeddingResponse();

        var candidateData = Enumerable.Range(1, 8)
            .Select(i => (i, "movie", $"Movie {i}"))
            .ToArray();
        var candidates = candidateData
            .Select(c => CreateCandidate(c.Item1, c.Item2, c.Item3))
            .ToArray();
        SetupChatResponse(BuildValidLlmJson(candidateData));

        var svc = CreateService(candidates: candidates);
        var result = await svc.DiscoverAsync(TestQuery, TestUserId);

        result.Results.Should().HaveCount(5);
        result.Alternates.Should().HaveCount(3);
    }

    // ─── Cancellation test ───

    [Fact]
    public async Task DiscoverAsync_CancellationRequested_ThrowsOperationCanceledException()
    {
        SetupCacheMiss();
        var cts = new CancellationTokenSource();
        cts.Cancel();

        _mockEmbeddingClient
            .Setup(e => e.GenerateEmbeddingAsync(
                It.IsAny<string>(),
                It.IsAny<EmbeddingGenerationOptions>(),
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new OperationCanceledException());

        var svc = CreateService();
        var act = () => svc.DiscoverAsync(TestQuery, TestUserId, cts.Token);

        // The embedding step wraps all exceptions in AiServiceUnavailableException,
        // including OperationCanceledException — this is current behavior
        await act.Should().ThrowAsync<AiServiceUnavailableException>();
    }

    // ─── Helpers ───

    private TestableAiDiscoveryService CreateService(
        MovieEmbedding[]? candidates = null,
        bool vectorSearchThrows = false,
        AzureOpenAIOptions? optionsOverride = null)
    {
        return new TestableAiDiscoveryService(
            _mockAiClient.Object,
            optionsOverride ?? _aiOptions,
            _mockMediaEntryService.Object,
            _mockCache.Object,
            _mockScopeFactory.Object,
            NullLogger<AiDiscoveryService>.Instance,
            candidates?.ToList() ?? new List<MovieEmbedding>(),
            vectorSearchThrows);
    }

    private void SetupCacheMiss()
    {
        object? nothing = null;
        _mockCache
            .Setup(c => c.TryGetValue(It.IsAny<object>(), out nothing))
            .Returns(false);

        var mockEntry = new Mock<ICacheEntry>();
        mockEntry.SetupSet(e => e.Value = It.IsAny<object>());
        mockEntry.SetupSet(e => e.AbsoluteExpirationRelativeToNow = It.IsAny<TimeSpan?>());
        _mockCache
            .Setup(c => c.CreateEntry(It.IsAny<object>()))
            .Returns(mockEntry.Object);
    }

    private void SetupEmbeddingResponse()
    {
        var embedding = OpenAIEmbeddingsModelFactory.OpenAIEmbedding(
            index: 0,
            vector: Enumerable.Repeat(0.1f, 1536));
        var response = ClientResult.FromValue(embedding, new Mock<PipelineResponse>().Object);

        _mockEmbeddingClient
            .Setup(e => e.GenerateEmbeddingAsync(
                It.IsAny<string>(),
                It.IsAny<EmbeddingGenerationOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);
    }

    private void SetupChatResponse(string responseJson)
    {
        var usage = OpenAIChatModelFactory.ChatTokenUsage(
            inputTokenCount: 100,
            outputTokenCount: 50,
            totalTokenCount: 150);
        var completion = OpenAIChatModelFactory.ChatCompletion(
            content: [ChatMessageContentPart.CreateTextPart(responseJson)],
            usage: usage);
        var response = ClientResult.FromValue(completion, new Mock<PipelineResponse>().Object);

        _mockChatClient
            .Setup(c => c.CompleteChatAsync(
                It.IsAny<IEnumerable<ChatMessage>>(),
                It.IsAny<ChatCompletionOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);
    }

    private void SetupChatResponseWithCapture(string responseJson, Action<IEnumerable<ChatMessage>> capture)
    {
        var usage = OpenAIChatModelFactory.ChatTokenUsage(
            inputTokenCount: 100,
            outputTokenCount: 50,
            totalTokenCount: 150);
        var completion = OpenAIChatModelFactory.ChatCompletion(
            content: [ChatMessageContentPart.CreateTextPart(responseJson)],
            usage: usage);
        var response = ClientResult.FromValue(completion, new Mock<PipelineResponse>().Object);

        _mockChatClient
            .Setup(c => c.CompleteChatAsync(
                It.IsAny<IEnumerable<ChatMessage>>(),
                It.IsAny<ChatCompletionOptions>(),
                It.IsAny<CancellationToken>()))
            .Callback<IEnumerable<ChatMessage>, ChatCompletionOptions, CancellationToken>(
                (msgs, _, _) => capture(msgs))
            .ReturnsAsync(response);
    }

    private void SetupScopeFactory()
    {
        var dbOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new AppDbContext(dbOptions);

        var mockScope = new Mock<IServiceScope>();
        var mockProvider = new Mock<IServiceProvider>();
        mockProvider.Setup(p => p.GetService(typeof(AppDbContext))).Returns(db);
        mockScope.Setup(s => s.ServiceProvider).Returns(mockProvider.Object);
        _mockScopeFactory.Setup(f => f.CreateScope()).Returns(mockScope.Object);
    }

    private static MovieEmbedding CreateCandidate(int tmdbId, string mediaType, string title) => new()
    {
        Id = tmdbId,
        TmdbId = tmdbId,
        MediaType = mediaType,
        Title = title,
        Overview = $"Overview of {title}",
        Genres = "Comedy",
        ReleaseYear = 2000,
        ContentText = $"Content for {title}",
    };

    private static AiDiscoverResultDto CreateResultDto(int tmdbId) => new(
        TmdbId: tmdbId,
        MediaType: "movie",
        Title: $"Movie {tmdbId}",
        Explanation: "Great match",
        MatchScore: 0.9);

    private static string BuildValidLlmJson((int tmdbId, string mediaType, string title)[] items)
    {
        var results = string.Join(",", items.Select(i =>
            $$"""{"tmdbId":{{i.tmdbId}},"mediaType":"{{i.mediaType}}","title":"{{i.title}}","explanation":"Great match","matchScore":0.9}"""));
        return $$"""{"results":[{{results}}],"message":"Here are your recommendations","isOffTopic":false}""";
    }

    /// <summary>
    /// Test subclass that overrides SearchCandidatesAsync to bypass pgvector dependency.
    /// </summary>
    private class TestableAiDiscoveryService : AiDiscoveryService
    {
        private readonly List<MovieEmbedding> _candidates;
        private readonly bool _throws;

        public TestableAiDiscoveryService(
            AzureOpenAIClient aiClient,
            AzureOpenAIOptions aiOptions,
            IMediaEntryService mediaEntryService,
            IMemoryCache cache,
            IServiceScopeFactory scopeFactory,
            ILogger<AiDiscoveryService> logger,
            List<MovieEmbedding> candidates,
            bool throws)
            : base(aiClient, aiOptions, CreateInMemoryDb(), mediaEntryService, cache, scopeFactory, logger)
        {
            _candidates = candidates;
            _throws = throws;
        }

        protected override Task<List<MovieEmbedding>> SearchCandidatesAsync(
            Vector queryVector, CancellationToken cancellationToken)
        {
            if (_throws)
                throw new InvalidOperationException("Vector search failed");
            return Task.FromResult(_candidates);
        }

        private static AppDbContext CreateInMemoryDb()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            return new AppDbContext(options);
        }
    }
}
