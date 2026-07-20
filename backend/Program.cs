using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using backend.Configuration;
using backend.Data;
using backend.Filters;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Friendly 429 body. Rejections happen in middleware (before the controller runs),
    // so we write the message here. AI-discover gets budget-specific wording since that's
    // the cap recruiters are most likely to hit.
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;

        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter =
                ((int)retryAfter.TotalSeconds).ToString();
        }

        var message = context.HttpContext.Request.Path.StartsWithSegments("/api/ai-discover")
            ? "The site's daily AI discovery budget is used up for today. This is a small personal project, so AI runs on a tight limit — it'll be back tomorrow. Thanks for understanding!"
            : "Too many requests. Please slow down and try again in a moment.";

        await context.HttpContext.Response.WriteAsJsonAsync(new { error = message }, cancellationToken);
    };

    // Public read endpoints (TMDB proxy, search, discover, genres, etc.)
    // Per-IP: genre backdrops alone fire ~27 discover calls on first load,
    // plus ~10 per page navigation — 400 allows comfortable browsing headroom
    options.AddPolicy("standard", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 400,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 10,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
            }));

    // Auth endpoints (OAuth flow, login attempts)
    options.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));

    // Write operations (list/media-entry create, update, delete)
    options.AddPolicy("mutation", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));

    // AI discovery endpoint (per-user, 3 requests per 24h).
    // Each call hits Azure OpenAI (embedding + chat). Kept low so a single visitor can't
    // drain the whole site-wide daily budget — leaves room for other recruiters to try it.
    options.AddPolicy("ai", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromDays(1),
                QueueLimit = 0,
            }));

    // Seeding endpoint (per-user, 2 requests per hour).
    // POST /api/dev/seed triggers BULK Azure OpenAI embedding calls — this is the
    // single most expensive operation in the app, so cap it extremely hard.
    options.AddPolicy("seed", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 2,
                Window = TimeSpan.FromHours(1),
                QueueLimit = 0,
            }));

    // GLOBAL hard ceiling on AI-discover across ALL users combined: 20 calls per 24h.
    // Runs IN ADDITION to the per-user "ai" policy, so total Azure OpenAI spend is bounded
    // no matter how many users sign in. Intentionally tiny — this is a low-traffic,
    // recruiter-facing demo with no marketing, so a surprise bill must be impossible.
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
    {
        if (context.Request.Path.StartsWithSegments("/api/ai-discover"))
        {
            return RateLimitPartition.GetFixedWindowLimiter("ai-global", _ =>
                new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 20,
                    Window = TimeSpan.FromDays(1),
                    QueueLimit = 0,
                });
        }
        return RateLimitPartition.GetNoLimiter<string>("unlimited");
    });
});

builder.Services.AddControllers(options =>
    {
        options.Filters.Add<GlobalExceptionFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// CORS origins from configuration (comma-separated)
var corsOrigins = builder.Configuration["CorsOrigins"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? new[] { "http://localhost:3000", "http://frontend" };

builder.Services.AddCors(o => o.AddPolicy("Spa", p =>
{
    p.WithOrigins(corsOrigins)
     .AllowAnyHeader()
     .AllowAnyMethod()
     .AllowCredentials();
}));

// Health checks for Docker/k8s
builder.Services.AddHealthChecks();

// HSTS: instruct browsers to only ever use HTTPS for this domain (1 year).
// includeSubDomains covers api/subdomains; only applied in production (see app.UseHsts).
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddAuthServices(builder.Configuration, builder.Environment);

var app = builder.Build();

// Auto-apply EF Core migrations on startup (creates tables if they don't exist)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Configure forwarded headers for correct URL generation (fixes OAuth redirect_uri with port)
// Must clear default limits to trust headers from any proxy (needed for Docker networking)
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.All,
    ForwardLimit = null // Allow unlimited proxy hops (Azure ingress → nginx → Azure ingress → backend)
};
forwardedHeadersOptions.KnownNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

// In Azure Container Apps behind nginx, the X-Forwarded-Host header may get overwritten
// by Azure's internal ingress, causing ASP.NET to reconstruct OAuth redirect_uri with the
// internal hostname instead of the public domain. This middleware forces the correct host/scheme
// using the configured FrontendUrl, ensuring Google OAuth token exchange uses the right redirect_uri.
var frontendUrl = builder.Configuration["FrontendUrl"];
if (!string.IsNullOrEmpty(frontendUrl) && !frontendUrl.Contains("localhost"))
{
    var publicUri = new Uri(frontendUrl);
    var publicHost = publicUri.IsDefaultPort
        ? new HostString(publicUri.Host)
        : new HostString(publicUri.Host, publicUri.Port);
    app.Use((context, next) =>
    {
        context.Request.Scheme = publicUri.Scheme;
        context.Request.Host = publicHost;
        return next();
    });
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseRouting();
app.UseCors("Spa");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");
app.Run();
