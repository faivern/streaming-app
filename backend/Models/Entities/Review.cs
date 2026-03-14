using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Constants;

namespace backend.Models.Entities
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MediaEntryId { get; set; }

        [ForeignKey(nameof(MediaEntryId))]
        public MediaEntry MediaEntry { get; set; } = null!;

        [Required]
        [MaxLength(FieldLimits.ReviewContentMaxLength)]
        public string Content { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
