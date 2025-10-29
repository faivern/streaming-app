using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : Controller
    {
        [HttpGet("google")]
        public IActionResult GoogleLogin()
        {
            var props = new AuthenticationProperties
            {
                RedirectUri = "http://localhost:5173"
            };
            return Challenge(props, "Google");
        }

        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            var result = await HttpContext.AuthenticateAsync("External");
            if (!result.Succeeded || result.Principal is null)
                return Redirect("http://localhost:5173?auth=failed");

            var ext = result.Principal;
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, ext.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? Guid.NewGuid().ToString()),
                new(ClaimTypes.Name, ext.Identity?.Name ?? ""),
                new(ClaimTypes.Email, ext.FindFirst(ClaimTypes.Email)?.Value ?? "")
            };

            var picture = ext.FindFirst("picture")?.Value;
            if (!string.IsNullOrEmpty(picture))
                claims.Add(new("picture", picture));

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(8)
            });

            await HttpContext.SignOutAsync("External");
            return Redirect("http://localhost:5173");
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            if (User?.Identity?.IsAuthenticated != true)
                return Ok(null);

            return Ok(new
            {
                id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                name = User.Identity!.Name,
                email = User.FindFirst(ClaimTypes.Email)?.Value,
                pictureUrl = User.FindFirst("picture")?.Value
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
