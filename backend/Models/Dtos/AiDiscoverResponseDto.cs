namespace backend.Models.Dtos;

public record AiDiscoverResponseDto(
    List<AiDiscoverResultDto> Results,
    List<AiDiscoverResultDto> Alternates,
    string Message,
    long ResponseTimeMs
);
