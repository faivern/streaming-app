using System.Net;
using backend.Services.Tmdb;
using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Moq.Contrib.HttpClient;

namespace backend.Tests.Unit.Services;

public class TmdbServiceTests
{
    private readonly Mock<HttpMessageHandler> _handlerMock;
    private readonly TmdbService _service;

    public TmdbServiceTests()
    {
        _handlerMock = new Mock<HttpMessageHandler>(MockBehavior.Strict);
        var httpClient = _handlerMock.CreateClient();

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "TMDB:ApiKey", "test-api-key" }
            })
            .Build();

        var cache = new MemoryCache(new MemoryCacheOptions());
        _service = new TmdbService(httpClient, config, cache, NullLogger<TmdbService>.Instance);
    }

    private void SetupResponse(string urlContains, string responseBody, HttpStatusCode status = HttpStatusCode.OK)
    {
        _handlerMock
            .SetupRequest(HttpMethod.Get, r => r.RequestUri!.ToString().Contains(urlContains))
            .ReturnsResponse(status, responseBody);
    }

    // ── Caching ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetPopularMoviesAsync_CachesResult_SecondCallSkipsHttp()
    {
        SetupResponse("movie/popular", "{\"results\":[]}");

        var first = await _service.GetPopularMoviesAsync();
        var second = await _service.GetPopularMoviesAsync();

        first.Should().Be(second);
        _handlerMock.VerifyRequest(HttpMethod.Get,
            r => r.RequestUri!.ToString().Contains("movie/popular"),
            Times.Once());
    }

    // ── HTTP Error ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetPopularMoviesAsync_HttpError_ThrowsHttpRequestException()
    {
        SetupResponse("movie/popular", "error", HttpStatusCode.InternalServerError);

        await _service.Invoking(s => s.GetPopularMoviesAsync())
            .Should().ThrowAsync<HttpRequestException>();
    }

    // ── SearchMultiAsync ────────────────────────────────────────────────

    [Fact]
    public async Task SearchMultiAsync_UrlEncodesQuery()
    {
        string? capturedUrl = null;
        _handlerMock
            .SetupRequest(HttpMethod.Get, r =>
            {
                capturedUrl = r.RequestUri!.ToString();
                return capturedUrl.Contains("search/multi");
            })
            .ReturnsResponse("{\"results\":[]}");

        await _service.SearchMultiAsync("hello world & more");

        // Uri.ToString() unescapes %20→space but keeps %26 (& is a query delimiter)
        capturedUrl.Should().Contain("query=hello world %26 more");
    }

    // ── GetTrailerAsync ─────────────────────────────────────────────────

    [Fact]
    public async Task GetTrailerAsync_FindsYouTubeVideo_ReturnsEmbedUrl()
    {
        var json = """
        {
            "id": 1,
            "results": [
                { "site": "Vimeo", "key": "abc", "name": "Teaser" },
                { "site": "YouTube", "key": "dQw4w9WgXcQ", "name": "Official Trailer" }
            ]
        }
        """;
        SetupResponse("movie/1/videos", json);

        var (name, url) = await _service.GetTrailerAsync(backend.Models.Enums.MediaType.Movie, 1);

        name.Should().Be("Official Trailer");
        url.Should().Contain("youtube.com/embed/dQw4w9WgXcQ");
    }

    [Fact]
    public async Task GetTrailerAsync_NoYouTubeVideo_ReturnsNulls()
    {
        var json = """
        {
            "id": 1,
            "results": [
                { "site": "Vimeo", "key": "abc", "name": "Teaser" }
            ]
        }
        """;
        SetupResponse("movie/1/videos", json);

        var (name, url) = await _service.GetTrailerAsync(backend.Models.Enums.MediaType.Movie, 1);

        name.Should().BeNull();
        url.Should().BeNull();
    }

    // ── GetMovieDetailsTypedAsync ───────────────────────────────────────

    [Fact]
    public async Task GetMovieDetailsTypedAsync_DeserializesValidJson()
    {
        var json = """
        {
            "title": "Inception",
            "poster_path": "/poster.jpg",
            "backdrop_path": "/bg.jpg",
            "overview": "Dreams",
            "vote_average": 8.4,
            "runtime": 148,
            "release_date": "2010-07-16"
        }
        """;
        SetupResponse("movie/550", json);

        var result = await _service.GetMovieDetailsTypedAsync(550);

        result.Should().NotBeNull();
        result!.Title.Should().Be("Inception");
        result.Runtime.Should().Be(148);
        result.VoteAverage.Should().Be(8.4);
    }

    // ── AdvancedDiscoverAsync ───────────────────────────────────────────

    [Fact]
    public async Task AdvancedDiscoverAsync_BuildsCorrectQueryParams()
    {
        string? capturedUrl = null;
        _handlerMock
            .SetupRequest(HttpMethod.Get, r =>
            {
                capturedUrl = r.RequestUri!.ToString();
                return capturedUrl.Contains("discover/movie");
            })
            .ReturnsResponse("{\"results\":[]}");

        await _service.AdvancedDiscoverAsync(
            mediaType: "movie",
            genreIds: new[] { 28, 12 },
            primaryReleaseYearGte: 2000,
            primaryReleaseYearLte: 2020,
            voteAverageGte: 7.0m,
            runtimeGte: 90,
            runtimeLte: 180,
            language: "en",
            sortBy: "vote_average.desc",
            page: 2
        );

        capturedUrl.Should().Contain("with_genres=28,12");
        capturedUrl.Should().Contain("primary_release_date.gte=2000-01-01");
        capturedUrl.Should().Contain("primary_release_date.lte=2020-12-31");
        capturedUrl.Should().Contain("vote_average.gte=7.0");
        capturedUrl.Should().Contain("with_runtime.gte=90");
        capturedUrl.Should().Contain("with_runtime.lte=180");
        capturedUrl.Should().Contain("with_original_language=en");
        capturedUrl.Should().Contain("sort_by=vote_average.desc");
        capturedUrl.Should().Contain("page=2");
    }

    [Fact]
    public async Task AdvancedDiscoverAsync_TvType_SkipsRuntimeParams()
    {
        string? capturedUrl = null;
        _handlerMock
            .SetupRequest(HttpMethod.Get, r =>
            {
                capturedUrl = r.RequestUri!.ToString();
                return capturedUrl.Contains("discover/tv");
            })
            .ReturnsResponse("{\"results\":[]}");

        await _service.AdvancedDiscoverAsync(
            mediaType: "tv",
            runtimeGte: 30,
            runtimeLte: 60
        );

        capturedUrl.Should().NotContain("with_runtime");
    }

    [Fact]
    public async Task AdvancedDiscoverAsync_TvType_UsesFirstAirDate()
    {
        string? capturedUrl = null;
        _handlerMock
            .SetupRequest(HttpMethod.Get, r =>
            {
                capturedUrl = r.RequestUri!.ToString();
                return capturedUrl.Contains("discover/tv");
            })
            .ReturnsResponse("{\"results\":[]}");

        await _service.AdvancedDiscoverAsync(
            mediaType: "tv",
            primaryReleaseYearGte: 2015
        );

        capturedUrl.Should().Contain("first_air_date.gte=2015-01-01");
        capturedUrl.Should().NotContain("primary_release_date");
    }

    [Fact]
    public async Task AdvancedDiscoverAsync_WithWatchProvider_AddsRegion()
    {
        string? capturedUrl = null;
        _handlerMock
            .SetupRequest(HttpMethod.Get, r =>
            {
                capturedUrl = r.RequestUri!.ToString();
                return capturedUrl.Contains("discover/movie");
            })
            .ReturnsResponse("{\"results\":[]}");

        await _service.AdvancedDiscoverAsync(
            mediaType: "movie",
            withWatchProviders: 8,
            watchRegion: "SE"
        );

        capturedUrl.Should().Contain("with_watch_providers=8");
        capturedUrl.Should().Contain("watch_region=SE");
    }
}
