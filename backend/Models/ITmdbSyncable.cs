namespace backend.Models
{
    public interface ITmdbSyncable
    {
        string? Title { get; set; }
        string? PosterPath { get; set; }
        string? BackdropPath { get; set; }
        string? Overview { get; set; }
        double? VoteAverage { get; set; }
        int? Runtime { get; set; }
        string? ReleaseDate { get; set; }
        string? FirstAirDate { get; set; }
        int? NumberOfSeasons { get; set; }
        int? NumberOfEpisodes { get; set; }
        DateTime? LastTmdbSync { get; set; }
    }
}
