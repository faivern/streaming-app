using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class UserMediaEntry
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey(nameof(UserId))]
        public MoviebucketUser User { get; set; } = null!;

        [Required]
        public int TmdbId { get; set; }

        [Required]
        [MaxLength(10)]
        public string MediaType { get; set; } = null!; // "movie" or "tv"

        [MaxLength(500)]
        public string? Title { get; set; }

        [MaxLength(500)]
        public string? PosterPath { get; set; }

        [Required]
        public WatchStatus Status { get; set; } = WatchStatus.WantToWatch;

        [Range(1, 10)]
        public int? Rating { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? WatchedAt { get; set; }

        // Navigation property for optional 1:1 review
        public Review? Review { get; set; }
    }
}
