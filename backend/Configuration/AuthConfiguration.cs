using backend.Models.Entities;
using backend.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;

namespace backend.Configuration
{
    public static class AuthConfiguration
    {
        private const int MainCookieExpiryDays = 7;
        private const int ExternalCookieExpiryMinutes = 5;

        public static IServiceCollection AddAuthServices(
            this IServiceCollection services,
            IConfiguration configuration,
            IWebHostEnvironment environment)
        {
            // Persist Data Protection keys so OAuth state cookies survive app restarts
            // Use /keys in Docker (volume-mounted), otherwise .keys locally
            var keysDir = Directory.Exists("/keys")
                ? "/keys"
                : Path.Combine(environment.ContentRootPath, ".keys");
            services.AddDataProtection()
                .PersistKeysToFileSystem(new DirectoryInfo(keysDir))
                .SetApplicationName("Cinelas");

            // Determine cookie security based on environment and frontend URL
            // In Docker, frontend is HTTP (localhost:3000) proxying to HTTPS backend
            // Browsers won't store Secure cookies received over HTTP, so we must check frontend URL
            var frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
            var isFrontendHttps = frontendUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase);

            // Only require secure cookies if:
            // 1. Not in development, OR
            // 2. Frontend is HTTPS (meaning the full flow is HTTPS)
            var requireSecureCookies = !environment.IsDevelopment() || isFrontendHttps;

            var cookieSameSite = requireSecureCookies ? SameSiteMode.None : SameSiteMode.Lax;
            var cookieSecurePolicy = requireSecureCookies
                ? CookieSecurePolicy.Always
                : CookieSecurePolicy.SameAsRequest;

            services.AddIdentityCore<AppUser>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddSignInManager();

            services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = "Google";
            })
            .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, o =>
            {
                o.Cookie.Name = "CinelasAuth";
                o.Cookie.HttpOnly = true;
                o.Cookie.SecurePolicy = cookieSecurePolicy;
                o.Cookie.SameSite = cookieSameSite;
                o.Cookie.MaxAge = TimeSpan.FromDays(MainCookieExpiryDays);
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
                o.Cookie.MaxAge = TimeSpan.FromMinutes(ExternalCookieExpiryMinutes);
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
                o.ClientId = configuration["Authentication:Google:ClientId"]!;
                o.ClientSecret = configuration["Authentication:Google:ClientSecret"]!;
                o.SignInScheme = "External";
                o.Scope.Add("openid");
                o.Scope.Add("profile");
                o.Scope.Add("email");
                o.SaveTokens = false;
                o.ClaimActions.MapJsonKey("picture", "picture");
                o.ClaimActions.MapJsonKey("locale", "locale");
            });

            services.AddAuthorization();

            return services;
        }
    }
}
