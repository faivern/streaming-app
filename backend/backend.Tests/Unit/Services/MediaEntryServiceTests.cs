using backend.Models.Entities;
using backend.Models.Enums;
using backend.Services;
using backend.Tests.Helpers;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend.Tests.Unit.Services;

public class MediaEntryServiceTests : IDisposable
{
    private readonly Data.AppDbContext _db;
    private readonly MediaEntryService _service;
    private const string UserId = "user-1";
    private const string OtherUserId = "user-2";

    public MediaEntryServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _service = new MediaEntryService(_db, NullLogger<MediaEntryService>.Instance);
    }

    public void Dispose() => _db.Dispose();

    private MediaEntry MakeEntry(int tmdbId = 100, string mediaType = "movie", string userId = UserId)
        => new()
        {
            UserId = userId,
            TmdbId = tmdbId,
            MediaType = mediaType,
            Status = WatchStatus.WantToWatch
        };

    // ── CreateAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_AddsToDB_SetsTimestamps()
    {
        var entry = MakeEntry();
        var before = DateTime.UtcNow;

        var created = await _service.CreateAsync(entry);

        created.Id.Should().BeGreaterThan(0);
        created.CreatedAt.Should().BeOnOrAfter(before);
        created.UpdatedAt.Should().BeOnOrAfter(before);
        _db.MediaEntries.Should().HaveCount(1);
    }

    // ── GetUserEntriesAsync ─────────────────────────────────────────────

    [Fact]
    public async Task GetUserEntriesAsync_ReturnsOnlyUserEntries_OrderedByUpdatedAtDesc()
    {
        var entry1 = MakeEntry(tmdbId: 1);
        var entry2 = MakeEntry(tmdbId: 2);
        var otherEntry = MakeEntry(tmdbId: 3, userId: OtherUserId);

        await _service.CreateAsync(entry1);
        await _service.CreateAsync(entry2);
        await _service.CreateAsync(otherEntry);

        // Update entry1 to make it most recent
        entry1.Status = WatchStatus.Watched;
        await _service.UpdateAsync(entry1);

        var result = await _service.GetUserEntriesAsync(UserId);

        result.Should().HaveCount(2);
        result[0].TmdbId.Should().Be(1); // most recently updated
    }

    [Fact]
    public async Task GetUserEntriesAsync_IncludesReview()
    {
        var entry = MakeEntry();
        entry.Review = new Review { Content = "Great film!" };
        await _service.CreateAsync(entry);

        var result = await _service.GetUserEntriesAsync(UserId);

        result[0].Review.Should().NotBeNull();
        result[0].Review!.Content.Should().Be("Great film!");
    }

    // ── GetByIdAsync ────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_ReturnsEntry_ForCorrectUser()
    {
        var entry = MakeEntry();
        await _service.CreateAsync(entry);

        var result = await _service.GetByIdAsync(entry.Id, UserId);

        result.Should().NotBeNull();
        result!.TmdbId.Should().Be(100);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_ForWrongUser()
    {
        var entry = MakeEntry();
        await _service.CreateAsync(entry);

        var result = await _service.GetByIdAsync(entry.Id, OtherUserId);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_ForNonExistent()
    {
        var result = await _service.GetByIdAsync(999, UserId);

        result.Should().BeNull();
    }

    // ── GetByTmdbIdAsync ────────────────────────────────────────────────

    [Fact]
    public async Task GetByTmdbIdAsync_MatchesOnTmdbIdAndMediaTypeAndUserId()
    {
        var entry = MakeEntry(tmdbId: 42, mediaType: "movie");
        await _service.CreateAsync(entry);

        var result = await _service.GetByTmdbIdAsync(42, "movie", UserId);

        result.Should().NotBeNull();
        result!.TmdbId.Should().Be(42);
    }

    [Fact]
    public async Task GetByTmdbIdAsync_DifferentMediaType_ReturnsNull()
    {
        var entry = MakeEntry(tmdbId: 42, mediaType: "movie");
        await _service.CreateAsync(entry);

        var result = await _service.GetByTmdbIdAsync(42, "tv", UserId);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByTmdbIdAsync_DifferentUser_ReturnsNull()
    {
        var entry = MakeEntry(tmdbId: 42);
        await _service.CreateAsync(entry);

        var result = await _service.GetByTmdbIdAsync(42, "movie", OtherUserId);

        result.Should().BeNull();
    }

    // ── UpdateAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_SetsUpdatedAt()
    {
        var entry = MakeEntry();
        await _service.CreateAsync(entry);
        var originalUpdatedAt = entry.UpdatedAt;

        await Task.Delay(10);
        entry.Status = WatchStatus.Watched;
        await _service.UpdateAsync(entry);

        entry.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    // ── DeleteAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_ReturnsTrue_ForExisting()
    {
        var entry = MakeEntry();
        await _service.CreateAsync(entry);

        var result = await _service.DeleteAsync(entry.Id, UserId);

        result.Should().BeTrue();
        _db.MediaEntries.Should().BeEmpty();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_ForWrongUser()
    {
        var entry = MakeEntry();
        await _service.CreateAsync(entry);

        var result = await _service.DeleteAsync(entry.Id, OtherUserId);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_ForNonExistent()
    {
        var result = await _service.DeleteAsync(999, UserId);

        result.Should().BeFalse();
    }
}
