using System.Security.Claims;
using backend.Controllers;
using backend.Models.Dtos;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;

namespace backend.Tests.Unit.Controllers;

public class AiDiscoverControllerTests
{
    private readonly Mock<IAiDiscoveryService> _mockService;
    private readonly Mock<ILogger<AiDiscoverController>> _mockLogger;
    private readonly AiDiscoverController _controller;

    public AiDiscoverControllerTests()
    {
        _mockService = new Mock<IAiDiscoveryService>();
        _mockLogger = new Mock<ILogger<AiDiscoverController>>();
        _controller = new AiDiscoverController(_mockService.Object, _mockLogger.Object);

        // Set up authenticated user context
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, "test-user-id") };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    [Fact]
    public async Task Discover_EmptyQuery_Returns400()
    {
        var request = new AiDiscoverRequestDto("   ");
        var result = await _controller.Discover(request, CancellationToken.None);
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task Discover_QueryTooLong_Returns400()
    {
        var longQuery = new string('a', 501);
        var request = new AiDiscoverRequestDto(longQuery);
        var result = await _controller.Discover(request, CancellationToken.None);
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task Discover_QueryExactly500Chars_ReturnsOk()
    {
        var query = new string('a', 500);
        var request = new AiDiscoverRequestDto(query);
        var expectedResponse = new AiDiscoverResponseDto(
            new List<AiDiscoverResultDto>(),
            "No great matches found",
            100
        );
        _mockService.Setup(s => s.DiscoverAsync(query, "test-user-id", It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var result = await _controller.Discover(request, CancellationToken.None);
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task Discover_ValidQuery_ReturnsOkWithResults()
    {
        var request = new AiDiscoverRequestDto("time loop comedy");
        var expectedResponse = new AiDiscoverResponseDto(
            new List<AiDiscoverResultDto>
            {
                new(137, "movie", "Groundhog Day", "Classic time-loop comedy!", 0.98)
            },
            "Great pick!",
            1200
        );
        _mockService.Setup(s => s.DiscoverAsync("time loop comedy", "test-user-id", It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var result = await _controller.Discover(request, CancellationToken.None);
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AiDiscoverResponseDto>(okResult.Value);
        Assert.Single(response.Results);
        Assert.Equal(137, response.Results[0].TmdbId);
    }

    [Fact]
    public async Task Discover_ServiceThrows_Returns503WithRetryAfter()
    {
        var request = new AiDiscoverRequestDto("some query");
        _mockService.Setup(s => s.DiscoverAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new AiServiceUnavailableException("AI service temporarily unavailable"));

        var result = await _controller.Discover(request, CancellationToken.None);
        var statusResult = Assert.IsType<ObjectResult>(result);
        Assert.Equal(503, statusResult.StatusCode);
        Assert.Equal("30", _controller.Response.Headers["Retry-After"].ToString());
    }

    [Fact]
    public async Task Discover_HtmlInQuery_StripsTagsBeforeService()
    {
        var request = new AiDiscoverRequestDto("<script>alert(1)</script>time loop comedy");
        var expectedResponse = new AiDiscoverResponseDto(
            new List<AiDiscoverResultDto>(),
            "Here are some matches",
            100
        );
        // After sanitization the service should receive "alert(1)time loop comedy"
        _mockService.Setup(s => s.DiscoverAsync("alert(1)time loop comedy", "test-user-id", It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        var result = await _controller.Discover(request, CancellationToken.None);
        Assert.IsType<OkObjectResult>(result);
        _mockService.Verify(s => s.DiscoverAsync("alert(1)time loop comedy", "test-user-id", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Discover_OnlyHtmlTags_Returns400()
    {
        var request = new AiDiscoverRequestDto("<b></b><i></i>");
        var result = await _controller.Discover(request, CancellationToken.None);
        var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequest.StatusCode);
    }

    [Fact]
    public async Task Discover_NoUserClaim_ReturnsUnauthorized()
    {
        // Override with unauthenticated context
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(new ClaimsIdentity()) }
        };

        var request = new AiDiscoverRequestDto("some query");
        var result = await _controller.Discover(request, CancellationToken.None);
        Assert.IsType<UnauthorizedResult>(result);
    }
}
