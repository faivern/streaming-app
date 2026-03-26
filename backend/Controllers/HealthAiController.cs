using Azure.AI.OpenAI;
using backend.Data;
using backend.Models.Dtos;
using backend.Models.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("health")]
[Authorize]
public class HealthAiController : ControllerBase
{
    private readonly AzureOpenAIClient _aiClient;
    private readonly AzureOpenAIOptions _aiOptions;
    private readonly IWebHostEnvironment _env;
    private readonly AppDbContext _db;

    public HealthAiController(
        AzureOpenAIClient aiClient,
        AzureOpenAIOptions aiOptions,
        IWebHostEnvironment env,
        AppDbContext db)
    {
        _aiClient = aiClient;
        _aiOptions = aiOptions;
        _env = env;
        _db = db;
    }

    [HttpGet("ai")]
    public IActionResult GetAiHealth()
    {
        if (!_env.IsDevelopment())
            return NotFound();

        return Ok(new
        {
            status = "ok",
            provider = "AzureOpenAI",
            embeddingDeployment = _aiOptions.EmbeddingDeployment,
            chatDeployment = _aiOptions.ChatDeployment
        });
    }

    [HttpGet("seed")]
    public async Task<IActionResult> GetSeedStatus()
    {
        if (!_env.IsDevelopment())
            return NotFound();

        var movieCount = await _db.MovieEmbeddings
            .CountAsync(e => e.MediaType == "movie");
        var tvCount = await _db.MovieEmbeddings
            .CountAsync(e => e.MediaType == "tv");

        var totalTarget = 15_000;
        var phase = movieCount < 10_000 ? "movies"
                  : tvCount < 5_000 ? "tv"
                  : "complete";

        return Ok(new SeedStatusDto(
            Phase: phase,
            MovieCount: movieCount,
            TvCount: tvCount,
            TotalTarget: totalTarget,
            PercentComplete: Math.Round((movieCount + tvCount) / (double)totalTarget * 100, 1)
        ));
    }
}
