using backend.Models.Entities;
using backend.Services;
using backend.Tests.Helpers;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;

namespace backend.Tests.Unit.Services;

public class ListServiceTests : IDisposable
{
    private readonly Data.AppDbContext _db;
    private readonly ListService _service;
    private const string UserId = "user-1";
    private const string OtherUserId = "user-2";

    public ListServiceTests()
    {
        _db = TestDbContextFactory.Create();
        _service = new ListService(_db, NullLogger<ListService>.Instance);
    }

    public void Dispose() => _db.Dispose();

    private Models.Entities.List MakeList(string name = "Test List", string userId = UserId)
        => new() { UserId = userId, Name = name };

    // ── CreateAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task CreateAsync_AddsToDB_SetsTimestamps()
    {
        var list = MakeList();
        var before = DateTime.UtcNow;

        var created = await _service.CreateAsync(list);

        created.Id.Should().BeGreaterThan(0);
        created.CreatedAt.Should().BeOnOrAfter(before);
        created.UpdatedAt.Should().BeOnOrAfter(before);
        _db.Lists.Should().HaveCount(1);
    }

    // ── GetUserListsAsync ───────────────────────────────────────────────

    [Fact]
    public async Task GetUserListsAsync_ReturnsOnlyUserLists_OrderedByUpdatedAtDesc()
    {
        var list1 = MakeList("First");
        var list2 = MakeList("Second");
        var otherList = MakeList("Other User's", OtherUserId);

        await _service.CreateAsync(list1);
        await _service.CreateAsync(list2);
        await _service.CreateAsync(otherList);

        // Update list1 to make it most recent
        list1.Name = "First Updated";
        await _service.UpdateAsync(list1);

        var result = await _service.GetUserListsAsync(UserId);

        result.Should().HaveCount(2);
        result[0].Name.Should().Be("First Updated"); // most recently updated
        result[1].Name.Should().Be("Second");
    }

    // ── GetByIdAsync ────────────────────────────────────────────────────

    [Fact]
    public async Task GetByIdAsync_ReturnsListForCorrectUser()
    {
        var list = MakeList();
        await _service.CreateAsync(list);

        var result = await _service.GetByIdAsync(list.Id, UserId);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Test List");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_ForWrongUser()
    {
        var list = MakeList();
        await _service.CreateAsync(list);

        var result = await _service.GetByIdAsync(list.Id, OtherUserId);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_ForNonExistent()
    {
        var result = await _service.GetByIdAsync(999, UserId);

        result.Should().BeNull();
    }

    // ── UpdateAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAsync_UpdatesUpdatedAt()
    {
        var list = MakeList();
        await _service.CreateAsync(list);
        var originalUpdatedAt = list.UpdatedAt;

        // Small delay to ensure timestamp difference
        await Task.Delay(10);
        list.Name = "Updated Name";
        await _service.UpdateAsync(list);

        list.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    // ── DeleteAsync ─────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAsync_ReturnsTrue_ForExisting()
    {
        var list = MakeList();
        await _service.CreateAsync(list);

        var result = await _service.DeleteAsync(list.Id, UserId);

        result.Should().BeTrue();
        _db.Lists.Should().BeEmpty();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_ForWrongUser()
    {
        var list = MakeList();
        await _service.CreateAsync(list);

        var result = await _service.DeleteAsync(list.Id, OtherUserId);

        result.Should().BeFalse();
        _db.Lists.Should().HaveCount(1);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_ForNonExistent()
    {
        var result = await _service.DeleteAsync(999, UserId);

        result.Should().BeFalse();
    }

    // ── GetUserListCountAsync ───────────────────────────────────────────

    [Fact]
    public async Task GetUserListCountAsync_ReturnsCorrectCount()
    {
        await _service.CreateAsync(MakeList("List 1"));
        await _service.CreateAsync(MakeList("List 2"));
        await _service.CreateAsync(MakeList("Other", OtherUserId));

        var count = await _service.GetUserListCountAsync(UserId);

        count.Should().Be(2);
    }

    [Fact]
    public async Task GetUserListCountAsync_ReturnsZero_ForNoLists()
    {
        var count = await _service.GetUserListCountAsync(UserId);

        count.Should().Be(0);
    }
}
