namespace backend.Models.Dtos;

public record AiDiscoverResultDto(
    int TmdbId,
    string MediaType,
    string Title,
    string Explanation,
    double MatchScore
);
