using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/diagnostics")]
public class DiagnosticsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IServiceProvider _services;
    private readonly IConfiguration _configuration;

    public DiagnosticsController(
        AppDbContext db,
        IServiceProvider services,
        IConfiguration configuration)
    {
        _db = db;
        _services = services;
        _configuration = configuration;
    }

    [HttpGet("ai-status")]
    public async Task<IActionResult> AiStatus(CancellationToken ct)
    {
        var result = new Dictionary<string, object>();

        // 1. Check if AI services are registered in DI
        var aiServiceRegistered = _services.GetService<IAiDiscoveryService>() is not null;
        result["aiServiceRegistered"] = aiServiceRegistered;

        // 2. Check env var presence (values redacted)
        var endpoint = _configuration["AzureOpenAI:Endpoint"];
        var apiKey = _configuration["AzureOpenAI:ApiKey"];
        result["envVars"] = new
        {
            endpointSet = !string.IsNullOrEmpty(endpoint),
            apiKeySet = !string.IsNullOrEmpty(apiKey),
            endpointPrefix = string.IsNullOrEmpty(endpoint) ? "(empty)" : endpoint[..Math.Min(30, endpoint.Length)] + "..."
        };

        // 3. Check pgvector extension
        try
        {
            var pgvectorInstalled = await _db.Database
                .SqlQueryRaw<int>("SELECT 1 AS \"Value\" FROM pg_extension WHERE extname = 'vector'")
                .AnyAsync(ct);
            result["pgvectorInstalled"] = pgvectorInstalled;
        }
        catch (Exception ex)
        {
            result["pgvectorInstalled"] = $"error: {ex.Message}";
        }

        // 4. Check MovieEmbeddings table row counts
        try
        {
            var movieCount = await _db.MovieEmbeddings.CountAsync(e => e.MediaType == "movie", ct);
            var tvCount = await _db.MovieEmbeddings.CountAsync(e => e.MediaType == "tv", ct);
            result["embeddings"] = new { movieCount, tvCount, total = movieCount + tvCount };
        }
        catch (Exception ex)
        {
            result["embeddings"] = $"error: {ex.Message}";
        }

        // 5. Check Data Protection key persistence
        var keysDir = Directory.Exists("/keys") ? "/keys" : "ephemeral (.keys)";
        result["dataProtectionKeysDir"] = keysDir;

        // 6. Uptime
        result["processUptime"] = (DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime()).ToString(@"d\.hh\:mm\:ss");

        return Ok(result);
    }
}
