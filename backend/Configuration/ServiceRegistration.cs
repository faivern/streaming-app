using System.Net;
using Azure.AI.OpenAI;
using System.ClientModel;
using backend.BackgroundJobs;
using backend.Data;
using backend.Models.Options;
using backend.Services;
using backend.Services.Tmdb;
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;

namespace backend.Configuration
{
    public static class ServiceRegistration
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddMemoryCache();
            services.AddHttpClient<ITmdbService, TmdbService>()
                .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
                {
                    AutomaticDecompression = DecompressionMethods.All
                });
            services.AddScoped<IListService, ListService>();
            services.AddScoped<IMediaEntryService, MediaEntryService>();
            services.AddHostedService<TmdbRefreshBackgroundService>();

            services.AddDbContext<AppDbContext>(o =>
                o.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    npgsqlOptions => npgsqlOptions.UseVector()));

            // Azure OpenAI (v2.0 AI Discovery) — optional; app starts without it
            var azureOpenAiEndpoint = configuration["AzureOpenAI:Endpoint"];
            var azureOpenAiApiKey = configuration["AzureOpenAI:ApiKey"];

            if (!string.IsNullOrEmpty(azureOpenAiEndpoint) && !string.IsNullOrEmpty(azureOpenAiApiKey))
            {
                Console.WriteLine("[Startup] AI Discovery: env vars found, registering services (endpoint={0})",
                    azureOpenAiEndpoint[..Math.Min(30, azureOpenAiEndpoint.Length)]);

                services.AddSingleton(new AzureOpenAIClient(
                    new Uri(azureOpenAiEndpoint),
                    new ApiKeyCredential(azureOpenAiApiKey)));

                services.AddSingleton(new AzureOpenAIOptions(
                    EmbeddingDeployment: configuration["AzureOpenAI:EmbeddingDeployment"] ?? "text-embedding-3-small",
                    ChatDeployment: configuration["AzureOpenAI:ChatDeployment"] ?? "gpt-4o-mini",
                    Temperature: float.TryParse(configuration["AzureOpenAI:Temperature"], out var temp) ? temp : 0.3f,
                    MaxTokens: int.TryParse(configuration["AzureOpenAI:MaxTokens"], out var mt) ? mt : 1024,
                    SystemPromptOverride: configuration["AzureOpenAI:SystemPromptOverride"] ?? "",
                    QueryRewriteMaxTokens: int.TryParse(configuration["AzureOpenAI:QueryRewriteMaxTokens"], out var qrmt) ? qrmt : 300,
                    QueryRewriteTemperature: float.TryParse(configuration["AzureOpenAI:QueryRewriteTemperature"], out var qrt) ? qrt : 0.7f
                ));

                services.AddScoped<IAiDiscoveryService, AiDiscoveryService>();
                services.AddScoped<IEmbeddingSeedService, EmbeddingSeedService>();
                services.AddHostedService<EmbeddingSeedBackgroundService>();
            }
            else
            {
                Console.WriteLine("[Startup] AI Discovery: DISABLED — env vars missing (Endpoint={0}, ApiKey={1})",
                    string.IsNullOrEmpty(azureOpenAiEndpoint) ? "EMPTY" : "set",
                    string.IsNullOrEmpty(azureOpenAiApiKey) ? "EMPTY" : "set");
            }

            return services;
        }
    }
}
