using System.ComponentModel.DataAnnotations.Schema;
using Pgvector;

namespace backend.Models.Entities;

public class MovieEmbedding
{
    public int Id { get; set; }
    public int TmdbId { get; set; }
    public string MediaType { get; set; } = null!;  // "movie" or "tv"
    public string? Title { get; set; }
    public string? Overview { get; set; }
    public string? Genres { get; set; }
    public string? Keywords { get; set; }
    public string? CastCrew { get; set; }
    public int? ReleaseYear { get; set; }
    public double? VoteAverage { get; set; }
    public string ContentText { get; set; } = null!;

    [Column(TypeName = "vector(1536)")]
    public Vector Embedding { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
