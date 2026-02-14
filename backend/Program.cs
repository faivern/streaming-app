using backend.Services;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Persist Data Protection keys so OAuth state cookies survive app restarts
// Use /keys in Docker (volume-mounted), otherwise .keys locally
var keysDir = Directory.Exists("/keys")
    ? "/keys"
    : Path.Combine(builder.Environment.ContentRootPath, ".keys");
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(keysDir))
    .SetApplicationName("Cinelas");

// Determine cookie security based on environment and frontend URL
// In Docker, frontend is HTTP (localhost:3000) proxying to HTTPS backend
// Browsers won't store Secure cookies received over HTTP, so we must check frontend URL
var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:5173";
var isFrontendHttps = frontendUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase);

// Only require secure cookies if:
// 1. Not in development, OR
// 2. Frontend is HTTPS (meaning the full flow is HTTPS)
var requireSecureCookies = !builder.Environment.IsDevelopment() || isFrontendHttps;

var cookieSameSite = requireSecureCookies ? SameSiteMode.None : SameSiteMode.Lax;
var cookieSecurePolicy = requireSecureCookies
    ? CookieSecurePolicy.Always
    : CookieSecurePolicy.SameAsRequest;

builder.Services.AddControllers()
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

builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<TmdbService>();
builder.Services.AddScoped<ListService>();
builder.Services.AddScoped<MediaEntryService>();
builder.Services.AddHostedService<TmdbRefreshBackgroundService>();

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentityCore<AppUser>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = "Google";
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, o=>
{
    o.Cookie.Name ="CinelasAuth";
    o.Cookie.HttpOnly = true;
    o.Cookie.SecurePolicy = cookieSecurePolicy;
    o.Cookie.SameSite = cookieSameSite;
    o.Cookie.MaxAge = TimeSpan.FromDays(7);
    o.Events = new CookieAuthenticationEvents
    {
        OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = 401;
            return Task.CompletedTask;
        }
    };
})
.AddCookie("External", o =>
{
    o.Cookie.Name = "CinelasExternalAuth";
    o.Cookie.HttpOnly = true;
    o.Cookie.SecurePolicy = cookieSecurePolicy;
    o.Cookie.SameSite = cookieSameSite;
    o.Cookie.MaxAge = TimeSpan.FromMinutes(5);
    o.Events = new CookieAuthenticationEvents
    {
        OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = 401;
            return Task.CompletedTask;
        }
    };
})
.AddGoogle("Google", o =>
{
    o.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
    o.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
    // Use default /signin-google callback path
    o.SignInScheme = "External";
    o.Scope.Add("openid");
    o.Scope.Add("profile");
    o.Scope.Add("email");
    o.SaveTokens = true;
    o.ClaimActions.MapJsonKey("picture", "picture");
    o.ClaimActions.MapJsonKey("locale", "locale");
});


builder.Services.AddAuthorization();

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
    ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.All
};
forwardedHeadersOptions.KnownNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

if (app.Environment.IsDevelopment()) {
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
