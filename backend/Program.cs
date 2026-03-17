using backend.Configuration;
using backend.Data;
using backend.Filters;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

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
    app.UseHttpsRedirection();
}

app.UseRouting();
app.UseCors("Spa");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");
app.Run();
