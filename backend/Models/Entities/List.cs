using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Constants;

namespace backend.Models.Entities
{
    public class List
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        [ForeignKey(nameof(UserId))]
        public AppUser User { get; set; } = null!;

        [Required]
        [MaxLength(FieldLimits.ListNameMaxLength)]
        public string Name { get; set; } = null!;

        [MaxLength(FieldLimits.ListDescriptionMaxLength)]
        public string? Description { get; set; }

        public bool IsPublic { get; set; } = false;

        [MaxLength(FieldLimits.UrlPathMaxLength)]
        public string? ThumbnailPath { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property for list items
        public ICollection<ListItem> Items { get; set; } = new List<ListItem>();
    }
}
