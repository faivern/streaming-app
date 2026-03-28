using System.Security.Claims;
using backend.Models.Dtos;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace backend.Controllers;

[ApiController]
[Route("api/ai-discover")]
[Authorize]
[EnableRateLimiting("ai")]
public class AiDiscoverController : ControllerBase
{
    private readonly IAiDiscoveryService _aiService;
    private readonly ILogger<AiDiscoverController> _logger;

    public AiDiscoverController(IAiDiscoveryService aiService, ILogger<AiDiscoverController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Discover(
        [FromBody] AiDiscoverRequestDto request,
        CancellationToken cancellationToken)
    {
        // Input validation per GUARD-01, D-04
        if (string.IsNullOrWhiteSpace(request.Query))
            return BadRequest(new { error = "Query cannot be empty." });

        if (request.Query.Length > 500)
            return BadRequest(new { error = "Query must be 500 characters or fewer." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            var response = await _aiService.DiscoverAsync(request.Query, userId, cancellationToken);
            return Ok(response);
        }
        catch (AiServiceUnavailableException ex)
        {
            _logger.LogWarning(ex, "AI service unavailable for query from user {UserId}", userId);
            Response.Headers["Retry-After"] = "30"; // per D-12
            return StatusCode(503, new { error = "AI service temporarily unavailable. Please try again shortly." });
        }
    }
}
