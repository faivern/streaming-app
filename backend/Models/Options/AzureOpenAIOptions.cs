namespace backend.Models.Options;

public record AzureOpenAIOptions(
    string EmbeddingDeployment,
    string ChatDeployment,
    float Temperature = 0.3f,
    int MaxTokens = 1024,
    string SystemPromptOverride = ""
);
