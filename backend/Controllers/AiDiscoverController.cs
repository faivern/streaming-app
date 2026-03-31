using System.Security.Claims;
using System.Text.RegularExpressions;
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
public partial class AiDiscoverController : ControllerBase
{
    private readonly IAiDiscoveryService _aiService;
    private readonly ILogger<AiDiscoverController> _logger;

    [GeneratedRegex("<[^>]*>")]
    private static partial Regex HtmlTagRegex();

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

        if (request.Query.Length > 300)
            return BadRequest(new { error = "Query must be 300 characters or fewer." });

        // Sanitize: strip HTML tags and trim
        var sanitizedQuery = HtmlTagRegex().Replace(request.Query, "").Trim();

        if (string.IsNullOrWhiteSpace(sanitizedQuery))
            return BadRequest(new { error = "Query cannot be empty." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        try
        {
            var response = await _aiService.DiscoverAsync(sanitizedQuery, userId, cancellationToken);
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
