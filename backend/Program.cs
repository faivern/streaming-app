using backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(o => o.AddPolicy("Spa",
  p => p.WithOrigins("http://localhost:5173")
  .AllowAnyHeader()
  .AllowAnyMethod()
  .AllowCredentials()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<TmdbService>();

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseNpgsql("Data Source=moviebucket.db"));

builder.Services.AddIdentityCore<IdentityUser>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = "Google";
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, o=>
{
    o.Cookie.Name ="MovieBucketAuth";
    o.Cookie.HttpOnly = true;
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    o.Cookie.SameSite = SameSiteMode.None;
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
    o.Cookie.Name = "MovieBucketExternalAuth";
    o.Cookie.HttpOnly = true;
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    o.Cookie.SameSite = SameSiteMode.None;
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
   // o.CallbackPath = "/api/auth/google-callback";
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
app.Run();