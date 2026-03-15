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

    /// <summary>
    /// Captures the URL from a request matching the given path segment.
    /// </summary>
    private string? SetupWithUrlCapture(string pathContains)
    {
        string? capturedUrl = null;
        _handlerMock
            .SetupRequest(HttpMethod.Get, r =>
            {
                var url = r.RequestUri!.ToString();
                if (!url.Contains(pathContains)) return false;
                capturedUrl = url;
                return true;
            })
            .ReturnsResponse("{\"results\":[]}");
        return capturedUrl;
    }

    private async Task<string?> CaptureUrl(string pathContains, Func<Task> action)
    {
        string? capturedUrl = null;
        _handlerMock
            .SetupRequest(HttpMethod.Get, r =>
            {
                var url = r.RequestUri!.ToString();
                if (!url.Contains(pathContains)) return false;
                capturedUrl = url;
                return true;
            })
            .ReturnsResponse("{\"results\":[]}");
        await action();
        return capturedUrl;
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

    // ── GetPopularShowsAsync ──────────────────────────────────────────────

    [Fact]
    public async Task GetPopularShowsAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("tv/popular", () => _service.GetPopularShowsAsync());
        url.Should().Contain("tv/popular");
    }

    // ── GetUpcomingMoviesAsync ─────────────────────────────────────────────

    [Fact]
    public async Task GetUpcomingMoviesAsync_IncludesTodayAsReleaseDate()
    {
        var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var url = await CaptureUrl("discover/movie", () => _service.GetUpcomingMoviesAsync());

        url.Should().Contain($"primary_release_date.gte={today}");
        url.Should().Contain("sort_by=popularity.desc");
    }

    [Fact]
    public async Task GetUpcomingTvAsync_IncludesTodayAsFirstAirDate()
    {
        var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
        var url = await CaptureUrl("discover/tv", () => _service.GetUpcomingTvAsync());

        url.Should().Contain($"first_air_date.gte={today}");
        url.Should().Contain("sort_by=popularity.desc");
    }

    // ── GetTopRatedAsync ──────────────────────────────────────────────────

    [Fact]
    public async Task GetTopRatedMoviesAsync_IncludesVoteCountFilter()
    {
        var url = await CaptureUrl("discover/movie", () => _service.GetTopRatedMoviesAsync());

        url.Should().Contain("sort_by=vote_average.desc");
        url.Should().Contain("vote_count.gte=");
    }

    [Fact]
    public async Task GetTopRatedTvAsync_IncludesVoteCountFilter()
    {
        var url = await CaptureUrl("discover/tv", () => _service.GetTopRatedTvAsync());

        url.Should().Contain("sort_by=vote_average.desc");
        url.Should().Contain("vote_count.gte=");
    }

    // ── Trending ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetTrendingAllDailyAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("trending/all/day", () => _service.GetTrendingAllDailyAsync());
        url.Should().Contain("trending/all/day");
    }

    [Fact]
    public async Task GetTrendingMoviesDailyAsync_IncludesPageParam()
    {
        var url = await CaptureUrl("trending/movie/day", () => _service.GetTrendingMoviesDailyAsync(page: 3));
        url.Should().Contain("page=3");
    }

    [Fact]
    public async Task GetTrendingTvDailyAsync_IncludesPageParam()
    {
        var url = await CaptureUrl("trending/tv/day", () => _service.GetTrendingTvDailyAsync(page: 5));
        url.Should().Contain("page=5");
    }

    // ── Details ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetMovieDetailsAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("movie/550", () => _service.GetMovieDetailsAsync(550));
        url.Should().Contain("movie/550");
    }

    [Fact]
    public async Task GetShowDetailsAsync_IncludesExternalIds()
    {
        var url = await CaptureUrl("tv/1396", () => _service.GetShowDetailsAsync(1396));
        url.Should().Contain("tv/1396");
        url.Should().Contain("append_to_response=external_ids");
    }

    // ── GetTvDetailsTypedAsync ────────────────────────────────────────────

    [Fact]
    public async Task GetTvDetailsTypedAsync_DeserializesValidJson()
    {
        var json = """
        {
            "name": "Breaking Bad",
            "poster_path": "/poster.jpg",
            "backdrop_path": "/bg.jpg",
            "overview": "A chemistry teacher...",
            "vote_average": 9.5,
            "first_air_date": "2008-01-20",
            "number_of_seasons": 5,
            "number_of_episodes": 62
        }
        """;
        SetupResponse("tv/1396", json);

        var result = await _service.GetTvDetailsTypedAsync(1396);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Breaking Bad");
        result.NumberOfSeasons.Should().Be(5);
        result.NumberOfEpisodes.Should().Be(62);
        result.VoteAverage.Should().Be(9.5);
    }

    // ── GetVideosAsync ────────────────────────────────────────────────────

    [Fact]
    public async Task GetVideosAsync_Movie_UsesMoviePath()
    {
        var url = await CaptureUrl("movie/550/videos",
            () => _service.GetVideosAsync(backend.Models.Enums.MediaType.Movie, 550));
        url.Should().Contain("movie/550/videos");
    }

    [Fact]
    public async Task GetVideosAsync_Tv_UsesTvPath()
    {
        var url = await CaptureUrl("tv/1396/videos",
            () => _service.GetVideosAsync(backend.Models.Enums.MediaType.Tv, 1396));
        url.Should().Contain("tv/1396/videos");
    }

    // ── GetTrailerAsync (TV path) ─────────────────────────────────────────

    [Fact]
    public async Task GetTrailerAsync_TvType_UsesTvPath()
    {
        var json = """
        {
            "id": 1396,
            "results": [
                { "site": "YouTube", "key": "abc123", "name": "Season 1 Trailer" }
            ]
        }
        """;
        SetupResponse("tv/1396/videos", json);

        var (name, url) = await _service.GetTrailerAsync(backend.Models.Enums.MediaType.Tv, 1396);

        name.Should().Be("Season 1 Trailer");
        url.Should().Contain("youtube.com/embed/abc123");
    }

    // ── Keywords ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetMovieKeywordsAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("movie/550/keywords", () => _service.GetMovieKeywordsAsync(550));
        url.Should().Contain("movie/550/keywords");
    }

    [Fact]
    public async Task GetShowKeywordsAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("tv/1396/keywords", () => _service.GetShowKeywordsAsync(1396));
        url.Should().Contain("tv/1396/keywords");
    }

    // ── Credits ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetMovieCreditsAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("movie/550/credits", () => _service.GetMovieCreditsAsync(550));
        url.Should().Contain("movie/550/credits");
    }

    [Fact]
    public async Task GetShowCreditsAsync_UsesAggregateCredits()
    {
        var url = await CaptureUrl("tv/1396/aggregate_credits", () => _service.GetShowCreditsAsync(1396));
        url.Should().Contain("tv/1396/aggregate_credits");
    }

    // ── Similar ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetSimilarMoviesAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("movie/550/similar", () => _service.GetSimilarMoviesAsync(550));
        url.Should().Contain("movie/550/similar");
    }

    [Fact]
    public async Task GetSimilarShowsAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("tv/1396/similar", () => _service.GetSimilarShowsAsync(1396));
        url.Should().Contain("tv/1396/similar");
    }

    // ── Person ────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetPersonDetailsAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("person/287", () => _service.GetPersonDetailsAsync(287));
        url.Should().Contain("person/287");
    }

    [Fact]
    public async Task GetCombinedCreditsAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("person/287/combined_credits", () => _service.GetCombinedCreditsAsync(287));
        url.Should().Contain("person/287/combined_credits");
    }

    // ── Discover ──────────────────────────────────────────────────────────

    [Fact]
    public async Task GetDiscoverMovieAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("discover/movie", () => _service.GetDiscoverMovieAsync());
        url.Should().Contain("discover/movie");
        url.Should().Contain("include_adult=false");
    }

    [Fact]
    public async Task GetDiscoverTvAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("discover/tv", () => _service.GetDiscoverTvAsync());
        url.Should().Contain("discover/tv");
        url.Should().Contain("include_adult=false");
    }

    // ── DiscoverByGenreAsync ──────────────────────────────────────────────

    [Fact]
    public async Task DiscoverByGenreAsync_BuildsCorrectUrl()
    {
        var url = await CaptureUrl("discover/movie",
            () => _service.DiscoverByGenreAsync("movie", genreId: 28, page: 2, sortBy: "vote_average.desc"));

        url.Should().Contain("with_genres=28");
        url.Should().Contain("page=2");
        url.Should().Contain("sort_by=vote_average.desc");
    }

    // ── Genres ─────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetMovieGenreAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("genre/movie/list", () => _service.GetMovieGenreAsync());
        url.Should().Contain("genre/movie/list");
    }

    [Fact]
    public async Task GetTvGenreAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("genre/tv/list", () => _service.GetTvGenreAsync());
        url.Should().Contain("genre/tv/list");
    }

    // ── Collections ───────────────────────────────────────────────────────

    [Fact]
    public async Task SearchCollectionsAsync_EncodesQueryAndIncludesParams()
    {
        var url = await CaptureUrl("search/collection",
            () => _service.SearchCollectionsAsync("Star Wars", page: 2, lang: "sv-SE"));

        url.Should().Contain("search/collection");
        url.Should().Contain("page=2");
        url.Should().Contain("language=sv-SE");
    }

    [Fact]
    public async Task GetCollectionByIdAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("collection/10",
            () => _service.GetCollectionByIdAsync(10, lang: "en-US"));

        url.Should().Contain("collection/10");
        url.Should().Contain("language=en-US");
    }

    // ── Images ────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetMovieImagesAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("movie/550/images", () => _service.GetMovieImagesAsync(550));
        url.Should().Contain("movie/550/images");
    }

    [Fact]
    public async Task GetSeriesImagesAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("tv/1396/images", () => _service.GetSeriesImagesAsync(1396));
        url.Should().Contain("tv/1396/images");
    }

    // ── Watch Providers ───────────────────────────────────────────────────

    [Fact]
    public async Task GetMovieWatchProvidersAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("movie/550/watch/providers",
            () => _service.GetMovieWatchProvidersAsync(550));
        url.Should().Contain("movie/550/watch/providers");
    }

    [Fact]
    public async Task GetTvWatchProvidersAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("tv/1396/watch/providers",
            () => _service.GetTvWatchProvidersAsync(1396));
        url.Should().Contain("tv/1396/watch/providers");
    }

    [Fact]
    public async Task GetWatchProviderRegionsAsync_HitsCorrectEndpoint()
    {
        var url = await CaptureUrl("watch/providers/regions",
            () => _service.GetWatchProviderRegionsAsync());
        url.Should().Contain("watch/providers/regions");
    }

    [Fact]
    public async Task GetMovieWatchProvidersListAsync_IncludesRegion()
    {
        var url = await CaptureUrl("watch/providers/movie",
            () => _service.GetMovieWatchProvidersListAsync("SE"));
        url.Should().Contain("watch/providers/movie");
        url.Should().Contain("watch_region=SE");
    }

    [Fact]
    public async Task GetTvWatchProvidersListAsync_DefaultsToUS()
    {
        var url = await CaptureUrl("watch/providers/tv",
            () => _service.GetTvWatchProvidersListAsync());
        url.Should().Contain("watch/providers/tv");
        url.Should().Contain("watch_region=US");
    }

    // ── Constructor ───────────────────────────────────────────────────────

    [Fact]
    public void Constructor_MissingApiKey_ThrowsInvalidOperationException()
    {
        var handler = new Mock<HttpMessageHandler>();
        var httpClient = handler.CreateClient();
        var emptyConfig = new ConfigurationBuilder().Build();
        var cache = new MemoryCache(new MemoryCacheOptions());

        var act = () => new TmdbService(httpClient, emptyConfig, cache, NullLogger<TmdbService>.Instance);

        act.Should().Throw<InvalidOperationException>().WithMessage("*missing*");
    }
}
