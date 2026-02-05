using System.Text.Json.Serialization;

namespace backend.Models
{
    public sealed class TmdbMovieDetails
    {
        [JsonPropertyName("title")]
        public string? Title { get; init; }

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; init; }

        [JsonPropertyName("backdrop_path")]
        public string? BackdropPath { get; init; }

        [JsonPropertyName("overview")]
        public string? Overview { get; init; }

        [JsonPropertyName("vote_average")]
        public double? VoteAverage { get; init; }

        [JsonPropertyName("runtime")]
        public int? Runtime { get; init; }

        [JsonPropertyName("release_date")]
        public string? ReleaseDate { get; init; }
    }

    public sealed class TmdbTvDetails
    {
        [JsonPropertyName("name")]
        public string? Name { get; init; }

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; init; }

        [JsonPropertyName("backdrop_path")]
        public string? BackdropPath { get; init; }

        [JsonPropertyName("overview")]
        public string? Overview { get; init; }

        [JsonPropertyName("vote_average")]
        public double? VoteAverage { get; init; }

        [JsonPropertyName("first_air_date")]
        public string? FirstAirDate { get; init; }

        [JsonPropertyName("number_of_seasons")]
        public int? NumberOfSeasons { get; init; }

        [JsonPropertyName("number_of_episodes")]
        public int? NumberOfEpisodes { get; init; }
    }
}
