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
            services.AddHttpClient<ITmdbService, TmdbService>();
            services.AddScoped<IListService, ListService>();
            services.AddScoped<IMediaEntryService, MediaEntryService>();
            services.AddHostedService<TmdbRefreshBackgroundService>();

            services.AddDbContext<AppDbContext>(o =>
                o.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    npgsqlOptions => npgsqlOptions.UseVector()));

            // Azure OpenAI (v2.0 AI Discovery)
            var azureOpenAiEndpoint = configuration["AzureOpenAI:Endpoint"]
                ?? throw new InvalidOperationException(
                    "Azure OpenAI configuration is missing. Set AZURE_OPENAI_ENDPOINT in environment.");

            var azureOpenAiApiKey = configuration["AzureOpenAI:ApiKey"]
                ?? throw new InvalidOperationException(
                    "Azure OpenAI configuration is missing. Set AZURE_OPENAI_API_KEY in environment.");

            services.AddSingleton(new AzureOpenAIClient(
                new Uri(azureOpenAiEndpoint),
                new ApiKeyCredential(azureOpenAiApiKey)));

            services.AddSingleton(new AzureOpenAIOptions(
                EmbeddingDeployment: configuration["AzureOpenAI:EmbeddingDeployment"] ?? "text-embedding-3-small",
                ChatDeployment: configuration["AzureOpenAI:ChatDeployment"] ?? "gpt-4o-mini"
            ));

            return services;
        }
    }
}
