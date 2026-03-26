using System.Text.Json.Serialization;

namespace backend.Models.Tmdb
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

        [JsonPropertyName("genres")]
        public List<TmdbGenre>? Genres { get; init; }

        [JsonPropertyName("keywords")]
        public TmdbKeywordsMovie? Keywords { get; init; }

        [JsonPropertyName("credits")]
        public TmdbCredits? Credits { get; init; }
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

        [JsonPropertyName("genres")]
        public List<TmdbGenre>? Genres { get; init; }

        [JsonPropertyName("keywords")]
        public TmdbKeywordsTv? Keywords { get; init; }

        [JsonPropertyName("credits")]
        public TmdbCredits? Credits { get; init; }

        [JsonPropertyName("created_by")]
        public List<TmdbCreator>? CreatedBy { get; init; }

        [JsonPropertyName("networks")]
        public List<TmdbNetwork>? Networks { get; init; }

        [JsonPropertyName("last_air_date")]
        public string? LastAirDate { get; init; }

        [JsonPropertyName("status")]
        public string? Status { get; init; }
    }

    public sealed class TmdbGenre
    {
        [JsonPropertyName("id")] public int Id { get; init; }
        [JsonPropertyName("name")] public string? Name { get; init; }
    }

    public sealed class TmdbKeyword
    {
        [JsonPropertyName("id")] public int Id { get; init; }
        [JsonPropertyName("name")] public string? Name { get; init; }
    }

    public sealed class TmdbCastMember
    {
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("order")] public int Order { get; init; }
    }

    public sealed class TmdbCrewMember
    {
        [JsonPropertyName("name")] public string? Name { get; init; }
        [JsonPropertyName("job")] public string? Job { get; init; }
    }

    public sealed class TmdbCreator
    {
        [JsonPropertyName("name")] public string? Name { get; init; }
    }

    public sealed class TmdbNetwork
    {
        [JsonPropertyName("name")] public string? Name { get; init; }
    }

    // Movie keywords wrapper: response shape is {"keywords": [...]}
    public sealed class TmdbKeywordsMovie
    {
        [JsonPropertyName("keywords")] public List<TmdbKeyword>? Keywords { get; init; }
    }

    // TV keywords wrapper: response shape is {"results": [...]} (TMDB API inconsistency)
    public sealed class TmdbKeywordsTv
    {
        [JsonPropertyName("results")] public List<TmdbKeyword>? Results { get; init; }
    }

    public sealed class TmdbCredits
    {
        [JsonPropertyName("cast")] public List<TmdbCastMember>? Cast { get; init; }
        [JsonPropertyName("crew")] public List<TmdbCrewMember>? Crew { get; init; }
    }
}
