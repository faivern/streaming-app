namespace backend.Models.Dtos
{
    public class CreateMediaEntryRequest
    {
        public int TmdbId { get; set; }
        public string MediaType { get; set; } = null!;
        public string? Title { get; set; }
        public string? PosterPath { get; set; }
        public string? BackdropPath { get; set; }
        public string? Overview { get; set; }
        public double? VoteAverage { get; set; }
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
