using backend.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(o => o.AddPolicy("Spa",
  p => p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<TmdbService>();

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlite("Data Source=moviebucket.db"));

builder.Services.AddIdentityCore<IdentityUser>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();

builder.Services.AddAuthentication()
    .AddCookie("External")
    .AddGoogle("Google", o =>
    {
        o.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
        o.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
        o.CallbackPath = "/auth/google-callback";
        o.SignInScheme = "External";
        o.Scope.Add("profile");
        o.Scope.Add("email");
        o.SaveTokens = true;
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment()) {
        app.UseSwagger();
        app.UseSwaggerUI();
   } 
           
app.UseHttpsRedirection();

app.UseRouting();
app.UseCors("Spa");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/auth/google", (HttpContext http) =>
{
    var props = new AuthenticationProperties { RedirectUri = "/auth/google-callback" };
    return Results.Challenge(props, new[] { "Google" });
});
app.MapGet("/auth/google-callback", () => Results.Ok(new { ok = true }));

app.Run();
