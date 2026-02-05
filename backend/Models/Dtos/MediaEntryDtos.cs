namespace backend.Models.Dtos
{
    public class CreateMediaEntryRequest
    {
        public int TmdbId { get; set; }
        public string MediaType { get; set; } = null!;
        public WatchStatus Status { get; set; } = WatchStatus.WantToWatch;
    }

    public class UpdateMediaEntryRequest
    {
        public WatchStatus? Status { get; set; }
        public double? RatingActing { get; set; }
        public double? RatingStory { get; set; }
        public double? RatingSoundtrack { get; set; }
        public double? RatingVisuals { get; set; }
        public DateTime? WatchedAt { get; set; }
    }

    public class UpsertReviewRequest
    {
        public string Content { get; set; } = null!;
    }
}
