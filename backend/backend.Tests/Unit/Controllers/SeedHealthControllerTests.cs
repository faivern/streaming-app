using Azure.AI.OpenAI;
using backend.Controllers;
using backend.Data;
using backend.Models.Dtos;
using backend.Models.Entities;
using backend.Models.Options;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Moq;
using System.ClientModel;

namespace backend.Tests.Unit.Controllers;

public class SeedHealthControllerTests
{
    private readonly AzureOpenAIClient _client;
    private readonly AzureOpenAIOptions _options;

    public SeedHealthControllerTests()
    {
        _client = new AzureOpenAIClient(
            new Uri("https://test.openai.azure.com/"),
            new ApiKeyCredential("test-key"));
        _options = new AzureOpenAIOptions("text-embedding-3-small", "gpt-4o-mini");
    }

    private static AppDbContext CreateInMemoryDb(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    private static void SeedEmbeddings(AppDbContext db, int movieCount, int tvCount)
    {
        for (var i = 0; i < movieCount; i++)
        {
            db.MovieEmbeddings.Add(new MovieEmbedding
            {
                TmdbId = 10000 + i,
                MediaType = "movie",
                ContentText = $"Movie {i}"
            });
        }
        for (var i = 0; i < tvCount; i++)
        {
            db.MovieEmbeddings.Add(new MovieEmbedding
            {
                TmdbId = 20000 + i,
                MediaType = "tv",
                ContentText = $"TV {i}"
            });
        }
        db.SaveChanges();
    }

    [Fact]
    public async Task GetSeedStatus_InDevelopment_ReturnsOkWithSeedStatusDto()
    {
        var env = new Mock<IWebHostEnvironment>();
        env.Setup(e => e.EnvironmentName).Returns(Environments.Development);
        using var db = CreateInMemoryDb(nameof(GetSeedStatus_InDevelopment_ReturnsOkWithSeedStatusDto));
        SeedEmbeddings(db, movieCount: 100, tvCount: 50);

        var controller = new HealthAiController(_client, _options, env.Object, db);
        var result = await controller.GetSeedStatus();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var dto = ok.Value.Should().BeOfType<SeedStatusDto>().Subject;
        dto.MovieCount.Should().Be(100);
        dto.TvCount.Should().Be(50);
        dto.TotalTarget.Should().Be(15_000);
    }

    [Fact]
    public async Task GetSeedStatus_InProduction_ReturnsNotFound()
    {
        var env = new Mock<IWebHostEnvironment>();
        env.Setup(e => e.EnvironmentName).Returns(Environments.Production);
        using var db = CreateInMemoryDb(nameof(GetSeedStatus_InProduction_ReturnsNotFound));

        var controller = new HealthAiController(_client, _options, env.Object, db);
        var result = await controller.GetSeedStatus();

        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetSeedStatus_Phase_IsMoviesWhenMovieCountBelowTarget()
    {
        var env = new Mock<IWebHostEnvironment>();
        env.Setup(e => e.EnvironmentName).Returns(Environments.Development);
        using var db = CreateInMemoryDb(nameof(GetSeedStatus_Phase_IsMoviesWhenMovieCountBelowTarget));
        SeedEmbeddings(db, movieCount: 5_000, tvCount: 0);

        var controller = new HealthAiController(_client, _options, env.Object, db);
        var result = await controller.GetSeedStatus();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var dto = ok.Value.Should().BeOfType<SeedStatusDto>().Subject;
        dto.Phase.Should().Be("movies");
    }

    [Fact]
    public async Task GetSeedStatus_Phase_IsTvWhenMoviesCompleteButTvBelow5000()
    {
        var env = new Mock<IWebHostEnvironment>();
        env.Setup(e => e.EnvironmentName).Returns(Environments.Development);
        using var db = CreateInMemoryDb(nameof(GetSeedStatus_Phase_IsTvWhenMoviesCompleteButTvBelow5000));
        SeedEmbeddings(db, movieCount: 10_000, tvCount: 2_000);

        var controller = new HealthAiController(_client, _options, env.Object, db);
        var result = await controller.GetSeedStatus();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var dto = ok.Value.Should().BeOfType<SeedStatusDto>().Subject;
        dto.Phase.Should().Be("tv");
    }

    [Fact]
    public async Task GetSeedStatus_Phase_IsCompleteWhenBothTargetsMet()
    {
        var env = new Mock<IWebHostEnvironment>();
        env.Setup(e => e.EnvironmentName).Returns(Environments.Development);
        using var db = CreateInMemoryDb(nameof(GetSeedStatus_Phase_IsCompleteWhenBothTargetsMet));
        SeedEmbeddings(db, movieCount: 10_000, tvCount: 5_000);

        var controller = new HealthAiController(_client, _options, env.Object, db);
        var result = await controller.GetSeedStatus();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var dto = ok.Value.Should().BeOfType<SeedStatusDto>().Subject;
        dto.Phase.Should().Be("complete");
    }

    [Fact]
    public async Task GetSeedStatus_PercentComplete_CalculatesCorrectly()
    {
        var env = new Mock<IWebHostEnvironment>();
        env.Setup(e => e.EnvironmentName).Returns(Environments.Development);
        using var db = CreateInMemoryDb(nameof(GetSeedStatus_PercentComplete_CalculatesCorrectly));
        // 7500 movies + 0 tv = 7500 / 15000 = 50.0%
        SeedEmbeddings(db, movieCount: 7_500, tvCount: 0);

        var controller = new HealthAiController(_client, _options, env.Object, db);
        var result = await controller.GetSeedStatus();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var dto = ok.Value.Should().BeOfType<SeedStatusDto>().Subject;
        dto.PercentComplete.Should().Be(50.0);
    }
}
