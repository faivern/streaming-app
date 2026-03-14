using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Constants;
using backend.Models.Enums;
using backend.Models.Interfaces;

namespace backend.Models.Entities
{
    public class MediaEntry : ITmdbSyncable
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
        [MaxLength(FieldLimits.MediaTypeMaxLength)]
        public string MediaType { get; set; } = null!; // "movie" or "tv"

        [MaxLength(FieldLimits.UrlPathMaxLength)]
        public string? Title { get; set; }

        [MaxLength(FieldLimits.UrlPathMaxLength)]
        public string? PosterPath { get; set; }

        [MaxLength(FieldLimits.UrlPathMaxLength)]
        public string? BackdropPath { get; set; }

        [MaxLength(FieldLimits.OverviewMaxLength)]
        public string? Overview { get; set; }

        public double? VoteAverage { get; set; }

        public int? Runtime { get; set; }

        [MaxLength(FieldLimits.DateStringMaxLength)]
        public string? ReleaseDate { get; set; }

        [MaxLength(FieldLimits.DateStringMaxLength)]
        public string? FirstAirDate { get; set; }

        public int? NumberOfSeasons { get; set; }

        public int? NumberOfEpisodes { get; set; }

        public DateTime? LastTmdbSync { get; set; }

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
