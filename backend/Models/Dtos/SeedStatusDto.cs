namespace backend.Models.Dtos;

public record SeedStatusDto(
    string Phase,
    int MovieCount,
    int TvCount,
    int TotalTarget,
    double PercentComplete
);
