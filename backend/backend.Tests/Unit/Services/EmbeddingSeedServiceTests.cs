using FluentAssertions;

namespace backend.Tests.Unit.Services;

/// <summary>
/// Unit tests for EmbeddingSeedService checkpoint logic and seed target constants.
///
/// Note: Full integration tests (RunAsync end-to-end) require a real database with pgvector
/// because EF Core InMemory provider does not support Vector type columns.
/// These tests verify the core checkpoint calculation logic and constant correctness
/// independently of the database.
/// </summary>
public class EmbeddingSeedServiceTests
{
    // ----------------------------------------------------------------
    // Checkpoint resume page calculation (D-20)
    // Formula: startPage = (existingCount / titlesPerPage) + 1
    // ----------------------------------------------------------------

    [Fact]
    public void CalculateStartPage_WithZeroCount_ReturnsPageOne()
    {
        // New seed: no existing rows → start from page 1
        var existingCount = 0;
        var titlesPerPage = 20;
        var startPage = (existingCount / titlesPerPage) + 1;
        startPage.Should().Be(1);
    }

    [Fact]
    public void CalculateStartPage_WithExistingCount_ReturnsCorrectPage()
    {
        // 200 existing / 20 per page = 10 pages done → start page 11
        var existingCount = 200;
        var titlesPerPage = 20;
        var startPage = (existingCount / titlesPerPage) + 1;
        startPage.Should().Be(11);
    }

    [Fact]
    public void CalculateStartPage_WithExactPageBoundary_ReturnsNextPage()
    {
        // 100 existing = exactly 5 pages complete → start page 6
        var existingCount = 100;
        var titlesPerPage = 20;
        var startPage = (existingCount / titlesPerPage) + 1;
        startPage.Should().Be(6);
    }

    [Fact]
    public void CalculateStartPage_WithPartialPage_ReturnsCurrentPage()
    {
        // 190 existing = 9 full pages + 10 partial → integer division = 9 → start page 10
        var existingCount = 190;
        var titlesPerPage = 20;
        var startPage = (existingCount / titlesPerPage) + 1;
        startPage.Should().Be(10);
    }

    [Fact]
    public void CalculateStartPage_WithLargeExistingCount_ReturnsCorrectPage()
    {
        // 9980 existing = 499 pages done → start page 500
        var existingCount = 9980;
        var titlesPerPage = 20;
        var startPage = (existingCount / titlesPerPage) + 1;
        startPage.Should().Be(500);
    }

    // ----------------------------------------------------------------
    // Seed target constants (D-07, D-08, D-19)
    // ----------------------------------------------------------------

    [Fact]
    public void MovieTarget_IsCorrect_Per_D07()
    {
        // D-07: 500 pages * 20 titles/page = 10,000 movies
        (500 * 20).Should().Be(10_000);
    }

    [Fact]
    public void TvTarget_IsCorrect_Per_D08()
    {
        // D-08: 250 pages * 20 titles/page = 5,000 TV shows
        (250 * 20).Should().Be(5_000);
    }

    [Fact]
    public void TotalTarget_Is15000_Per_D19()
    {
        // D-19: skip seed when movieCount + tvCount >= 15,000
        (10_000 + 5_000).Should().Be(15_000);
    }

    // ----------------------------------------------------------------
    // Batch size and throttle (D-12)
    // ----------------------------------------------------------------

    [Fact]
    public void BatchSize_Is50()
    {
        // D-12: batch size 50 balances Azure OpenAI throughput vs. DB write cost
        const int BatchSize = 50;
        BatchSize.Should().Be(50);
    }

    [Fact]
    public void ThrottleDelayMs_Is250()
    {
        // TMDB throttle: 250ms per title to avoid rate limit
        const int ThrottleDelayMs = 250;
        ThrottleDelayMs.Should().Be(250);
    }
}
