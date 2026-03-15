using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Tests.Helpers;

public abstract class AuthenticatedControllerTestBase
{
    protected const string TestUserId = "test-user-id-123";

    protected static ControllerContext CreateAuthenticatedContext(string userId = TestUserId)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        return new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }
}
