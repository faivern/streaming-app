using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class ListItem
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

        public int? Runtime { get; set; }

        [MaxLength(10)]
        public string? ReleaseDate { get; set; }

        [MaxLength(10)]
        public string? FirstAirDate { get; set; }

        public int? NumberOfSeasons { get; set; }

        public int? NumberOfEpisodes { get; set; }

        public DateTime? LastTmdbSync { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
