using Microsoft.AspNetCore.Identity;

namespace backend.Models
{
    public class AppUser : IdentityUser
    {
        // Id, Email, UserName inherited from IdentityUser
        public string? DisplayName { get; set; }
        public string? AvatarUrl { get; set; }
    }
}
