namespace backend.Models.Dtos;

public record AiDiscoverResponseDto(
    List<AiDiscoverResultDto> Results,
    string Message,
    long ResponseTimeMs
);
