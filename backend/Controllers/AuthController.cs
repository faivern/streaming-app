using backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : Controller
    {
        private readonly string _frontendUrl;
        private readonly UserManager<MoviebucketUser> _userManager;

        public AuthController(IConfiguration configuration, UserManager<MoviebucketUser> userManager)
        {
            _frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
            _userManager = userManager;
        }

        [HttpGet("google")]
        public IActionResult GoogleLogin()
        {
            var props = new AuthenticationProperties
            {
                RedirectUri = "/api/auth/google-callback"
            };
            return Challenge(props, "Google");
        }

        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            var result = await HttpContext.AuthenticateAsync("External");
            if (!result.Succeeded || result.Principal is null)
                return Redirect($"{_frontendUrl}?auth=failed");

            var ext = result.Principal;
            var email = ext.FindFirst(ClaimTypes.Email)?.Value;
            var name = ext.Identity?.Name ?? "";
            var picture = ext.FindFirst("picture")?.Value;

            if (string.IsNullOrEmpty(email))
                return Redirect($"{_frontendUrl}?auth=failed&reason=no_email");

            // Find or create user in database
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                user = new MoviebucketUser
                {
                    Email = email,
                    UserName = email,
                    DisplayName = name,
                    AvatarUrl = picture,
                    EmailConfirmed = true // Google already verified the email
                };

                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                    return Redirect($"{_frontendUrl}?auth=failed&reason=create_failed");
            }
            else
            {
                // Update profile info if changed
                bool updated = false;
                if (user.DisplayName != name && !string.IsNullOrEmpty(name))
                {
                    user.DisplayName = name;
                    updated = true;
                }
                if (user.AvatarUrl != picture && !string.IsNullOrEmpty(picture))
                {
                    user.AvatarUrl = picture;
                    updated = true;
                }
                if (updated)
                    await _userManager.UpdateAsync(user);
            }

            // Create claims using database user's ID
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id), // Database ID, not Google's
                new(ClaimTypes.Name, user.DisplayName ?? ""),
                new(ClaimTypes.Email, user.Email ?? "")
            };

            if (!string.IsNullOrEmpty(user.AvatarUrl))
                claims.Add(new("picture", user.AvatarUrl));

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddDays(7) // Extended to 7 days
            });

            await HttpContext.SignOutAsync("External");
            return Redirect(_frontendUrl);
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            if (User?.Identity?.IsAuthenticated != true)
                return Unauthorized(new { isAuthenticated = false });

            return Ok(new
            {
                isAuthenticated = true,
                id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                name = User.Identity!.Name,
                email = User.FindFirst(ClaimTypes.Email)?.Value,
                picture = User.FindFirst("picture")?.Value
            });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok();
        }
    }
}
