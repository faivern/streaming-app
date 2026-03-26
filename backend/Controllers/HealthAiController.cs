using Azure.AI.OpenAI;
using backend.Models.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("health")]
[Authorize]
public class HealthAiController : ControllerBase
{
    private readonly AzureOpenAIClient _aiClient;
    private readonly AzureOpenAIOptions _aiOptions;
    private readonly IWebHostEnvironment _env;

    public HealthAiController(
        AzureOpenAIClient aiClient,
        AzureOpenAIOptions aiOptions,
        IWebHostEnvironment env)
    {
        _aiClient = aiClient;
        _aiOptions = aiOptions;
        _env = env;
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
}
