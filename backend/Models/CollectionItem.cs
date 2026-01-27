using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class CollectionItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CollectionId { get; set; }

        [ForeignKey(nameof(CollectionId))]
        public Collection Collection { get; set; } = null!;

        [Required]
        public int TmdbId { get; set; }

        [Required]
        [MaxLength(10)]
        public string MediaType { get; set; } = null!; // "movie" or "tv"

        [MaxLength(500)]
        public string? Title { get; set; }

        [MaxLength(500)]
        public string? PosterPath { get; set; }

        public int Position { get; set; } = 0;

        [MaxLength(500)]
        public string? Note { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
