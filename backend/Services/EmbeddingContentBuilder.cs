using System.Text;
using backend.Models.Tmdb;

namespace backend.Services;

/// <summary>
/// Builds natural-language content_text strings for movie and TV embeddings.
/// Quality of content_text directly determines embedding quality for AI similarity search.
/// </summary>
public static class EmbeddingContentBuilder
{
    /// <summary>
    /// Builds content_text for a movie per D-02 template:
    /// "{Title} ({Year}) is a {Genres} film directed by {Director}, starring {Cast}. {Overview} Keywords: {Keywords}. Rated {Rating}/10."
    /// Omits phrases when data is missing rather than producing empty labels.
    /// </summary>
    public static string BuildMovieText(TmdbMovieDetails d)
    {
        var year = d.ReleaseDate?.Length >= 4 ? d.ReleaseDate[..4] : "Unknown";
        var genres = d.Genres?.Select(g => g.Name).Where(n => !string.IsNullOrEmpty(n)).ToList()
                     ?? new List<string?>();
        var genreText = genres.Count > 0 ? string.Join(", ", genres) : null;

        var director = d.Credits?.Crew?
            .FirstOrDefault(c => c.Job == "Director")?.Name;
        var cast = d.Credits?.Cast?
            .OrderBy(c => c.Order).Take(5).Select(c => c.Name)
            .Where(n => !string.IsNullOrEmpty(n)).ToList() ?? new List<string?>();

        var keywords = d.Keywords?.Keywords?
            .Take(10).Select(k => k.Name).Where(n => !string.IsNullOrEmpty(n)).ToList()
            ?? new List<string?>();

        var sb = new StringBuilder();
        sb.Append($"{d.Title ?? "Unknown"} ({year}) is a {genreText ?? "film"} film");
        if (!string.IsNullOrEmpty(director))
            sb.Append($" directed by {director}");
        if (cast.Count > 0)
            sb.Append($", starring {string.Join(", ", cast)}");
        sb.Append('.');
        if (!string.IsNullOrEmpty(d.Overview))
            sb.Append($" {d.Overview}");
        if (keywords.Count > 0)
            sb.Append($" Keywords: {string.Join(", ", keywords)}.");
        if (d.VoteAverage.HasValue && d.VoteAverage > 0)
            sb.Append($" Rated {d.VoteAverage:F1}/10.");

        return sb.ToString();
    }

    /// <summary>
    /// Builds content_text for a TV show per D-03 template:
    /// "{Title} ({FirstAirYear}-{LastAirYear}) is a {Genres} series on {Network}, created by {Creator}, starring {Cast}. {Seasons} seasons. Status: {Status}. {Overview} Keywords: {Keywords}. Rated {Rating}/10."
    /// Omits phrases when data is missing.
    /// </summary>
    public static string BuildTvText(TmdbTvDetails d)
    {
        var firstYear = d.FirstAirDate?.Length >= 4 ? d.FirstAirDate[..4] : "Unknown";
        var lastYear = d.LastAirDate?.Length >= 4 ? d.LastAirDate[..4] : "";
        var yearRange = !string.IsNullOrEmpty(lastYear) ? $"{firstYear}-{lastYear}" : firstYear;

        var genres = d.Genres?.Select(g => g.Name).Where(n => !string.IsNullOrEmpty(n)).ToList()
                     ?? new List<string?>();
        var genreText = genres.Count > 0 ? string.Join(", ", genres) : null;

        var network = d.Networks?.FirstOrDefault()?.Name;
        var creator = d.CreatedBy?.FirstOrDefault()?.Name;
        var cast = d.Credits?.Cast?
            .OrderBy(c => c.Order).Take(5).Select(c => c.Name)
            .Where(n => !string.IsNullOrEmpty(n)).ToList() ?? new List<string?>();

        // TV keywords use "Results" property, not "Keywords" (TMDB API inconsistency — Pitfall 1)
        var keywords = d.Keywords?.Results?
            .Take(10).Select(k => k.Name).Where(n => !string.IsNullOrEmpty(n)).ToList()
            ?? new List<string?>();

        var sb = new StringBuilder();
        sb.Append($"{d.Name ?? "Unknown"} ({yearRange}) is a {genreText ?? "series"} series");
        if (!string.IsNullOrEmpty(network))
            sb.Append($" on {network}");
        if (!string.IsNullOrEmpty(creator))
            sb.Append($", created by {creator}");
        if (cast.Count > 0)
            sb.Append($", starring {string.Join(", ", cast)}");
        sb.Append('.');
        if (d.NumberOfSeasons.HasValue)
            sb.Append($" {d.NumberOfSeasons} seasons.");
        if (!string.IsNullOrEmpty(d.Status))
            sb.Append($" Status: {d.Status}.");
        if (!string.IsNullOrEmpty(d.Overview))
            sb.Append($" {d.Overview}");
        if (keywords.Count > 0)
            sb.Append($" Keywords: {string.Join(", ", keywords)}.");
        if (d.VoteAverage.HasValue && d.VoteAverage > 0)
            sb.Append($" Rated {d.VoteAverage:F1}/10.");

        return sb.ToString();
    }
}
