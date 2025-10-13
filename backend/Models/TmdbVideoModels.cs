using System.Text.Json.Serialization;

namespace backend.Models
{
    public sealed class TmdbVideoResponse
    {
        [JsonPropertyName("id")]
        public int Id { get; init; }

        [JsonPropertyName("results")]
        public List<TmdbVideo> Results { get; init; } = new();
    }

    public sealed class TmdbVideo
    {
        [JsonPropertyName("id")]
        public string? Id { get; init; }

        [JsonPropertyName("name")]
        public string? Name { get; init; }

        [JsonPropertyName("key")]
        public string? Key { get; init; } // YouTube video key => https://www.youtube.com/watch?v={Key}

        [JsonPropertyName("site")]
        public string? Site { get; init; }

        [JsonPropertyName("type")]
        public string? Type { get; init; } // e.g., "Trailer", "Teaser", "Clip"

        [JsonPropertyName("official")]
        public bool Official { get; init; }

        [JsonPropertyName("iso_639_1")]
        public string? Iso639_1 { get; init; } // e.g., "en", "sv"

        [JsonPropertyName("iso_3166_1")]
        public string? Iso3166_1 { get; init; } // e.g., "US", "SE"

        [JsonPropertyName("size")]
        public int? Size { get; init; } // Player size hint from TMDB (optional)

        [JsonPropertyName("published_at")]
        public DateTimeOffset? PublishedAt { get; init; } // ISO8601 from TMDB

    }
}
