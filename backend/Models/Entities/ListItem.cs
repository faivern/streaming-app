using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Constants;
using backend.Models.Interfaces;

namespace backend.Models.Entities
{
    public class ListItem : ITmdbSyncable
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ListId { get; set; }

        [ForeignKey(nameof(ListId))]
        public List List { get; set; } = null!;

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

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
