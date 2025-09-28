using Microsoft.AspNetCore.Identity;

namespace backend.Models
{
    public class MoviebucketUser : IdentityUser
    {
        public int? UserId { get; set; }
        public string? DisplayName { get; set; }
        public string? AvatarUrl { get; set; }
        
    }
}
