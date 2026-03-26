namespace backend.Models.Options;

public record AzureOpenAIOptions(
    string EmbeddingDeployment,
    string ChatDeployment
);
