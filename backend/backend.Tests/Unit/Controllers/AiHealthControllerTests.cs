using Azure.AI.OpenAI;
using backend.Controllers;
using backend.Models.Options;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Moq;
using System.ClientModel;

namespace backend.Tests.Unit.Controllers;

public class AiHealthControllerTests
{
    private readonly AzureOpenAIClient _client;
    private readonly AzureOpenAIOptions _options;

    public AiHealthControllerTests()
    {
        _client = new AzureOpenAIClient(
            new Uri("https://test.openai.azure.com/"),
            new ApiKeyCredential("test-key"));
        _options = new AzureOpenAIOptions("text-embedding-3-small", "gpt-4o-mini");
    }

    [Fact]
    public void GetAiHealth_InDevelopment_ReturnsOkWithConfig()
    {
        var env = new Mock<IWebHostEnvironment>();
        env.Setup(e => e.EnvironmentName).Returns(Environments.Development);

        var controller = new HealthAiController(_client, _options, env.Object);
        var result = controller.GetAiHealth();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var json = System.Text.Json.JsonSerializer.Serialize(ok.Value);
        json.Should().Contain("\"status\":\"ok\"");
        json.Should().Contain("\"embeddingDeployment\":\"text-embedding-3-small\"");
        json.Should().Contain("\"chatDeployment\":\"gpt-4o-mini\"");
    }

    [Fact]
    public void GetAiHealth_InProduction_ReturnsNotFound()
    {
        var env = new Mock<IWebHostEnvironment>();
        env.Setup(e => e.EnvironmentName).Returns(Environments.Production);

        var controller = new HealthAiController(_client, _options, env.Object);
        var result = controller.GetAiHealth();

        result.Should().BeOfType<NotFoundResult>();
    }
}
