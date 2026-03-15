using backend.Controllers;
using backend.Models.Dtos;
using backend.Models.Entities;
using backend.Models.Tmdb;
using backend.Services;
using backend.Services.Tmdb;
using backend.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace backend.Tests.Unit.Controllers;

public class ListControllerTests : AuthenticatedControllerTestBase
{
    private readonly Mock<IListService> _listServiceMock;
    private readonly Mock<ITmdbService> _tmdbServiceMock;
    private readonly ListController _controller;

    public ListControllerTests()
    {
        _listServiceMock = new Mock<IListService>();
        _tmdbServiceMock = new Mock<ITmdbService>();
        _controller = new ListController(_listServiceMock.Object, _tmdbServiceMock.Object)
        {
            ControllerContext = CreateAuthenticatedContext()
        };
    }

    // ── GetUserLists ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetUserLists_ReturnsOkWithLists()
    {
        var lists = new List<Models.Entities.List>
        {
            new() { Id = 1, Name = "Favorites", UserId = TestUserId }
        };
        _listServiceMock.Setup(s => s.GetUserListsAsync(TestUserId)).ReturnsAsync(lists);

        var result = await _controller.GetUserLists();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.Value.Should().BeEquivalentTo(lists);
    }

    // ── GetById ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetById_ExistingList_ReturnsOk()
    {
        var list = new Models.Entities.List { Id = 1, Name = "Test", UserId = TestUserId };
        _listServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(list);

        var result = await _controller.GetById(1);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ((Models.Entities.List)ok.Value!).Name.Should().Be("Test");
    }

    [Fact]
    public async Task GetById_NonExistent_ReturnsNotFound()
    {
        _listServiceMock.Setup(s => s.GetByIdAsync(999, TestUserId)).ReturnsAsync((Models.Entities.List?)null);

        var result = await _controller.GetById(999);

        result.Should().BeOfType<NotFoundResult>();
    }

    // ── Create ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_ValidRequest_ReturnsOkWithCreatedList()
    {
        var request = new CreateListRequest { Name = "New List", IsPublic = false };
        _listServiceMock.Setup(s => s.GetUserListCountAsync(TestUserId)).ReturnsAsync(0);
        _listServiceMock.Setup(s => s.CreateAsync(It.IsAny<Models.Entities.List>()))
            .ReturnsAsync((Models.Entities.List l) => l);

        var result = await _controller.Create(request);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var created = (Models.Entities.List)ok.Value!;
        created.Name.Should().Be("New List");
        created.UserId.Should().Be(TestUserId);
    }

    [Fact]
    public async Task Create_InvalidName_ReturnsBadRequest()
    {
        var request = new CreateListRequest { Name = "" };

        var result = await _controller.Create(request);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Create_MaxListsReached_ReturnsConflict()
    {
        var request = new CreateListRequest { Name = "One More" };
        _listServiceMock.Setup(s => s.GetUserListCountAsync(TestUserId))
            .ReturnsAsync(ListService.MaxListsPerUser);

        var result = await _controller.Create(request);

        var conflict = result.Should().BeOfType<ConflictObjectResult>().Subject;
        ((string)conflict.Value!).Should().Contain("maximum");
    }

    // ── Update ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Update_ExistingList_UpdatesFieldsAndReturnsOk()
    {
        var existing = new Models.Entities.List { Id = 1, Name = "Old", UserId = TestUserId, IsPublic = false };
        _listServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(existing);
        _listServiceMock.Setup(s => s.UpdateAsync(It.IsAny<Models.Entities.List>()))
            .ReturnsAsync((Models.Entities.List l) => l);

        var request = new UpdateListRequest { Name = "New Name", IsPublic = true };
        var result = await _controller.Update(1, request);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var updated = (Models.Entities.List)ok.Value!;
        updated.Name.Should().Be("New Name");
        updated.IsPublic.Should().BeTrue();
    }

    [Fact]
    public async Task Update_NonExistent_ReturnsNotFound()
    {
        _listServiceMock.Setup(s => s.GetByIdAsync(999, TestUserId)).ReturnsAsync((Models.Entities.List?)null);

        var result = await _controller.Update(999, new UpdateListRequest { Name = "X" });

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Update_InvalidName_ReturnsBadRequest()
    {
        var existing = new Models.Entities.List { Id = 1, Name = "Old", UserId = TestUserId };
        _listServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(existing);

        var result = await _controller.Update(1, new UpdateListRequest { Name = "   " });

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Update_NullNameField_SkipsNameUpdate()
    {
        var existing = new Models.Entities.List { Id = 1, Name = "Keep This", UserId = TestUserId };
        _listServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(existing);
        _listServiceMock.Setup(s => s.UpdateAsync(It.IsAny<Models.Entities.List>()))
            .ReturnsAsync((Models.Entities.List l) => l);

        var result = await _controller.Update(1, new UpdateListRequest { Description = "Updated desc" });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ((Models.Entities.List)ok.Value!).Name.Should().Be("Keep This");
    }

    // ── Delete ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_ExistingList_ReturnsNoContent()
    {
        _listServiceMock.Setup(s => s.DeleteAsync(1, TestUserId)).ReturnsAsync(true);

        var result = await _controller.Delete(1);

        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task Delete_NonExistent_ReturnsNotFound()
    {
        _listServiceMock.Setup(s => s.DeleteAsync(999, TestUserId)).ReturnsAsync(false);

        var result = await _controller.Delete(999);

        result.Should().BeOfType<NotFoundResult>();
    }

    // ── AddItem ───────────────────────────────────────────────────────────

    [Fact]
    public async Task AddItem_ValidMovie_FetchesTmdbAndReturnsOk()
    {
        var list = new Models.Entities.List { Id = 1, UserId = TestUserId, Items = new List<ListItem>() };
        _listServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(list);
        _listServiceMock.Setup(s => s.UpdateAsync(It.IsAny<Models.Entities.List>()))
            .ReturnsAsync((Models.Entities.List l) => l);

        _tmdbServiceMock.Setup(s => s.GetMovieDetailsTypedAsync(550))
            .ReturnsAsync(new TmdbMovieDetails { Title = "Fight Club", Runtime = 139 });

        var request = new AddListItemRequest { TmdbId = 550, MediaType = "movie" };
        var result = await _controller.AddItem(1, request);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var updated = (Models.Entities.List)ok.Value!;
        updated.Items.Should().HaveCount(1);
        updated.Items.First().Title.Should().Be("Fight Club");
    }

    [Fact]
    public async Task AddItem_ValidTv_FetchesTmdbAndReturnsOk()
    {
        var list = new Models.Entities.List { Id = 1, UserId = TestUserId, Items = new List<ListItem>() };
        _listServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(list);
        _listServiceMock.Setup(s => s.UpdateAsync(It.IsAny<Models.Entities.List>()))
            .ReturnsAsync((Models.Entities.List l) => l);

        _tmdbServiceMock.Setup(s => s.GetTvDetailsTypedAsync(1396))
            .ReturnsAsync(new TmdbTvDetails { Name = "Breaking Bad", NumberOfSeasons = 5 });

        var request = new AddListItemRequest { TmdbId = 1396, MediaType = "tv" };
        var result = await _controller.AddItem(1, request);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var updated = (Models.Entities.List)ok.Value!;
        updated.Items.First().Title.Should().Be("Breaking Bad");
    }

    [Fact]
    public async Task AddItem_InvalidMediaType_ReturnsBadRequest()
    {
        var request = new AddListItemRequest { TmdbId = 1, MediaType = "anime" };

        var result = await _controller.AddItem(1, request);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task AddItem_ListNotFound_ReturnsNotFound()
    {
        _listServiceMock.Setup(s => s.GetByIdAsync(999, TestUserId)).ReturnsAsync((Models.Entities.List?)null);

        var request = new AddListItemRequest { TmdbId = 1, MediaType = "movie" };
        var result = await _controller.AddItem(999, request);

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task AddItem_MaxItemsReached_ReturnsConflict()
    {
        var items = Enumerable.Range(0, ListService.MaxItemsPerList)
            .Select(i => new ListItem { Id = i, TmdbId = i, MediaType = "movie" })
            .ToList();
        var list = new Models.Entities.List { Id = 1, UserId = TestUserId, Items = items };
        _listServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(list);

        var request = new AddListItemRequest { TmdbId = 9999, MediaType = "movie" };
        var result = await _controller.AddItem(1, request);

        result.Should().BeOfType<ConflictObjectResult>();
    }

    // ── RemoveItem ────────────────────────────────────────────────────────

    [Fact]
    public async Task RemoveItem_ExistingItem_ReturnsNoContent()
    {
        var item = new ListItem { Id = 42, TmdbId = 550, MediaType = "movie" };
        var list = new Models.Entities.List { Id = 1, UserId = TestUserId, Items = new List<ListItem> { item } };
        _listServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(list);
        _listServiceMock.Setup(s => s.UpdateAsync(It.IsAny<Models.Entities.List>()))
            .ReturnsAsync((Models.Entities.List l) => l);

        var result = await _controller.RemoveItem(1, 42);

        result.Should().BeOfType<NoContentResult>();
        list.Items.Should().BeEmpty();
    }

    [Fact]
    public async Task RemoveItem_ListNotFound_ReturnsNotFound()
    {
        _listServiceMock.Setup(s => s.GetByIdAsync(999, TestUserId)).ReturnsAsync((Models.Entities.List?)null);

        var result = await _controller.RemoveItem(999, 1);

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task RemoveItem_ItemNotInList_ReturnsNotFound()
    {
        var list = new Models.Entities.List { Id = 1, UserId = TestUserId, Items = new List<ListItem>() };
        _listServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(list);

        var result = await _controller.RemoveItem(1, 999);

        result.Should().BeOfType<NotFoundResult>();
    }
}
