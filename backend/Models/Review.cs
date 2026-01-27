using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserMediaEntryId { get; set; }

        [ForeignKey(nameof(UserMediaEntryId))]
        public UserMediaEntry UserMediaEntry { get; set; } = null!;

        [Required]
        [MaxLength(10000)]
        public string Content { get; set; } = null!;

        public bool IsPublic { get; set; } = true;

        public bool ContainsSpoilers { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
