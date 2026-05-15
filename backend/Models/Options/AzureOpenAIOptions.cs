namespace backend.Models.Options;

public record AzureOpenAIOptions(
    string EmbeddingDeployment,
    string ChatDeployment,
    float Temperature = 0.3f,
    int MaxTokens = 1024,
    string SystemPromptOverride = "",
    int QueryRewriteMaxTokens = 300,
    float QueryRewriteTemperature = 0.7f
);
