using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class MediaEntry
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey(nameof(UserId))]
        public AppUser User { get; set; } = null!;

        [Required]
        public int TmdbId { get; set; }

        [Required]
        [MaxLength(10)]
        public string MediaType { get; set; } = null!; // "movie" or "tv"

        [MaxLength(500)]
        public string? Title { get; set; }

        [MaxLength(500)]
        public string? PosterPath { get; set; }

        [MaxLength(500)]
        public string? BackdropPath { get; set; }

        [MaxLength(2000)]
        public string? Overview { get; set; }

        public double? VoteAverage { get; set; }

        [Required]
        public WatchStatus Status { get; set; } = WatchStatus.WantToWatch;

        public double? RatingActing { get; set; }

        public double? RatingStory { get; set; }

        public double? RatingSoundtrack { get; set; }

        public double? RatingVisuals { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? WatchedAt { get; set; }

        // Navigation property for optional 1:1 review
        public Review? Review { get; set; }
    }
}
