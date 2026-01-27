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

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
