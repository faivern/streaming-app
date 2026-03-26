namespace backend.Models.Entities;

public class AiQueryLog
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public string QueryText { get; set; } = null!;
    public string? ResultTmdbIds { get; set; }
    public int? ResponseTimeMs { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
