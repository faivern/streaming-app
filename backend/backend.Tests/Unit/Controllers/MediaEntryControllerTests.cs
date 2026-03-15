using backend.Controllers;
using backend.Models.Dtos;
using backend.Models.Entities;
using backend.Models.Enums;
using backend.Models.Tmdb;
using backend.Services;
using backend.Services.Tmdb;
using backend.Tests.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace backend.Tests.Unit.Controllers;

public class MediaEntryControllerTests : AuthenticatedControllerTestBase
{
    private readonly Mock<IMediaEntryService> _mediaEntryServiceMock;
    private readonly Mock<ITmdbService> _tmdbServiceMock;
    private readonly MediaEntryController _controller;

    public MediaEntryControllerTests()
    {
        _mediaEntryServiceMock = new Mock<IMediaEntryService>();
        _tmdbServiceMock = new Mock<ITmdbService>();
        _controller = new MediaEntryController(_mediaEntryServiceMock.Object, _tmdbServiceMock.Object)
        {
            ControllerContext = CreateAuthenticatedContext()
        };
    }

    // ── GetUserEntries ────────────────────────────────────────────────────

    [Fact]
    public async Task GetUserEntries_ReturnsOkWithEntries()
    {
        var entries = new List<MediaEntry> { new() { Id = 1, TmdbId = 100 } };
        _mediaEntryServiceMock.Setup(s => s.GetUserEntriesAsync(TestUserId)).ReturnsAsync(entries);

        var result = await _controller.GetUserEntries();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.Value.Should().BeEquivalentTo(entries);
    }

    // ── GetById ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetById_Existing_ReturnsOk()
    {
        var entry = new MediaEntry { Id = 1, TmdbId = 100, UserId = TestUserId };
        _mediaEntryServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(entry);

        var result = await _controller.GetById(1);

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetById_NonExistent_ReturnsNotFound()
    {
        _mediaEntryServiceMock.Setup(s => s.GetByIdAsync(999, TestUserId)).ReturnsAsync((MediaEntry?)null);

        var result = await _controller.GetById(999);

        result.Should().BeOfType<NotFoundResult>();
    }

    // ── GetByTmdbId ───────────────────────────────────────────────────────

    [Fact]
    public async Task GetByTmdbId_ValidType_ReturnsOk()
    {
        var entry = new MediaEntry { Id = 1, TmdbId = 42, MediaType = "movie" };
        _mediaEntryServiceMock.Setup(s => s.GetByTmdbIdAsync(42, "movie", TestUserId)).ReturnsAsync(entry);

        var result = await _controller.GetByTmdbId(42, "movie");

        result.Should().BeOfType<OkObjectResult>();
    }

    [Fact]
    public async Task GetByTmdbId_InvalidMediaType_ReturnsBadRequest()
    {
        var result = await _controller.GetByTmdbId(42, "anime");

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task GetByTmdbId_NotFound_ReturnsNotFound()
    {
        _mediaEntryServiceMock.Setup(s => s.GetByTmdbIdAsync(42, "movie", TestUserId)).ReturnsAsync((MediaEntry?)null);

        var result = await _controller.GetByTmdbId(42, "movie");

        result.Should().BeOfType<NotFoundResult>();
    }

    // ── Create ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_ValidMovie_FetchesTmdbAndReturnsOk()
    {
        _tmdbServiceMock.Setup(s => s.GetMovieDetailsTypedAsync(550))
            .ReturnsAsync(new TmdbMovieDetails { Title = "Fight Club", Runtime = 139 });
        _mediaEntryServiceMock.Setup(s => s.CreateAsync(It.IsAny<MediaEntry>()))
            .ReturnsAsync((MediaEntry e) => e);

        var request = new CreateMediaEntryRequest { TmdbId = 550, MediaType = "movie" };
        var result = await _controller.Create(request);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var created = (MediaEntry)ok.Value!;
        created.Title.Should().Be("Fight Club");
        created.UserId.Should().Be(TestUserId);
    }

    [Fact]
    public async Task Create_ValidTv_FetchesTmdbAndReturnsOk()
    {
        _tmdbServiceMock.Setup(s => s.GetTvDetailsTypedAsync(1396))
            .ReturnsAsync(new TmdbTvDetails { Name = "Breaking Bad", NumberOfSeasons = 5 });
        _mediaEntryServiceMock.Setup(s => s.CreateAsync(It.IsAny<MediaEntry>()))
            .ReturnsAsync((MediaEntry e) => e);

        var request = new CreateMediaEntryRequest { TmdbId = 1396, MediaType = "tv" };
        var result = await _controller.Create(request);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ((MediaEntry)ok.Value!).Title.Should().Be("Breaking Bad");
    }

    [Fact]
    public async Task Create_InvalidMediaType_ReturnsBadRequest()
    {
        var request = new CreateMediaEntryRequest { TmdbId = 1, MediaType = "series" };

        var result = await _controller.Create(request);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Create_TmdbReturnsNull_StillCreatesEntry()
    {
        _tmdbServiceMock.Setup(s => s.GetMovieDetailsTypedAsync(It.IsAny<int>()))
            .ReturnsAsync((TmdbMovieDetails?)null);
        _mediaEntryServiceMock.Setup(s => s.CreateAsync(It.IsAny<MediaEntry>()))
            .ReturnsAsync((MediaEntry e) => e);

        var request = new CreateMediaEntryRequest { TmdbId = 999999, MediaType = "movie" };
        var result = await _controller.Create(request);

        result.Should().BeOfType<OkObjectResult>();
        _mediaEntryServiceMock.Verify(s => s.CreateAsync(It.IsAny<MediaEntry>()), Times.Once);
    }

    // ── Update ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Update_ValidRatings_ReturnsOk()
    {
        var entry = new MediaEntry { Id = 1, UserId = TestUserId, MediaType = "movie" };
        _mediaEntryServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(entry);
        _mediaEntryServiceMock.Setup(s => s.UpdateAsync(It.IsAny<MediaEntry>()))
            .ReturnsAsync((MediaEntry e) => e);

        var request = new UpdateMediaEntryRequest { RatingActing = 8.5, Status = WatchStatus.Watched };
        var result = await _controller.Update(1, request);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var updated = (MediaEntry)ok.Value!;
        updated.RatingActing.Should().Be(8.5);
        updated.Status.Should().Be(WatchStatus.Watched);
    }

    [Fact]
    public async Task Update_NonExistent_ReturnsNotFound()
    {
        _mediaEntryServiceMock.Setup(s => s.GetByIdAsync(999, TestUserId)).ReturnsAsync((MediaEntry?)null);

        var result = await _controller.Update(999, new UpdateMediaEntryRequest { Status = WatchStatus.Watched });

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Update_InvalidRating_ReturnsBadRequest()
    {
        var entry = new MediaEntry { Id = 1, UserId = TestUserId, MediaType = "movie" };
        _mediaEntryServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(entry);

        var request = new UpdateMediaEntryRequest { RatingActing = 11.0 };
        var result = await _controller.Update(1, request);

        var bad = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        ((string)bad.Value!).Should().Contain("RatingActing");
    }

    // ── Delete ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_Existing_ReturnsNoContent()
    {
        _mediaEntryServiceMock.Setup(s => s.DeleteAsync(1, TestUserId)).ReturnsAsync(true);

        var result = await _controller.Delete(1);

        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task Delete_NonExistent_ReturnsNotFound()
    {
        _mediaEntryServiceMock.Setup(s => s.DeleteAsync(999, TestUserId)).ReturnsAsync(false);

        var result = await _controller.Delete(999);

        result.Should().BeOfType<NotFoundResult>();
    }

    // ── UpsertReview ──────────────────────────────────────────────────────

    [Fact]
    public async Task UpsertReview_NewReview_CreatesAndReturnsOk()
    {
        var entry = new MediaEntry { Id = 1, UserId = TestUserId, Review = null };
        _mediaEntryServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(entry);
        _mediaEntryServiceMock.Setup(s => s.UpdateAsync(It.IsAny<MediaEntry>()))
            .ReturnsAsync((MediaEntry e) => e);

        var request = new UpsertReviewRequest { Content = "Amazing film!" };
        var result = await _controller.UpsertReview(1, request);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var review = (Review)ok.Value!;
        review.Content.Should().Be("Amazing film!");
    }

    [Fact]
    public async Task UpsertReview_ExistingReview_UpdatesContent()
    {
        var existingReview = new Review { Id = 10, Content = "Old review", MediaEntryId = 1 };
        var entry = new MediaEntry { Id = 1, UserId = TestUserId, Review = existingReview };
        _mediaEntryServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(entry);
        _mediaEntryServiceMock.Setup(s => s.UpdateAsync(It.IsAny<MediaEntry>()))
            .ReturnsAsync((MediaEntry e) => e);

        var request = new UpsertReviewRequest { Content = "Updated review" };
        var result = await _controller.UpsertReview(1, request);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ((Review)ok.Value!).Content.Should().Be("Updated review");
    }

    [Fact]
    public async Task UpsertReview_NonExistentEntry_ReturnsNotFound()
    {
        _mediaEntryServiceMock.Setup(s => s.GetByIdAsync(999, TestUserId)).ReturnsAsync((MediaEntry?)null);

        var result = await _controller.UpsertReview(999, new UpsertReviewRequest { Content = "text" });

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task UpsertReview_TextTooLong_ReturnsBadRequest()
    {
        var longText = new string('x', MediaEntryService.ReviewTextMax + 1);
        var request = new UpsertReviewRequest { Content = longText };

        var result = await _controller.UpsertReview(1, request);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    // ── DeleteReview ──────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteReview_ExistingReview_ReturnsNoContent()
    {
        var entry = new MediaEntry
        {
            Id = 1, UserId = TestUserId,
            Review = new Review { Id = 10, Content = "To be deleted" }
        };
        _mediaEntryServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(entry);
        _mediaEntryServiceMock.Setup(s => s.UpdateAsync(It.IsAny<MediaEntry>()))
            .ReturnsAsync((MediaEntry e) => e);

        var result = await _controller.DeleteReview(1);

        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task DeleteReview_EntryNotFound_ReturnsNotFound()
    {
        _mediaEntryServiceMock.Setup(s => s.GetByIdAsync(999, TestUserId)).ReturnsAsync((MediaEntry?)null);

        var result = await _controller.DeleteReview(999);

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task DeleteReview_NoReviewExists_ReturnsNotFound()
    {
        var entry = new MediaEntry { Id = 1, UserId = TestUserId, Review = null };
        _mediaEntryServiceMock.Setup(s => s.GetByIdAsync(1, TestUserId)).ReturnsAsync(entry);

        var result = await _controller.DeleteReview(1);

        result.Should().BeOfType<NotFoundResult>();
    }
}
