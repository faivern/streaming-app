using backend.Services;
using FluentAssertions;

namespace backend.Tests.Unit.Services;

public class AiDiscoveryPromptsTests
{
    [Fact]
    public void SystemPrompt_IsNotNullOrEmpty()
    {
        AiDiscoveryPrompts.SystemPrompt.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void SystemPrompt_ContainsJsonFormatInstruction()
    {
        AiDiscoveryPrompts.SystemPrompt.Should().Contain("JSON");
    }

    [Fact]
    public void SystemPrompt_ContainsOffTopicInstruction()
    {
        AiDiscoveryPrompts.SystemPrompt.Should().Contain("isOffTopic");
    }

    [Fact]
    public void CandidateTemplate_ContainsTwoPlaceholders()
    {
        AiDiscoveryPrompts.CandidateTemplate.Should().Contain("{0}").And.Contain("{1}");
    }

    [Fact]
    public void CandidateItemTemplate_ContainsSixPlaceholders()
    {
        var template = AiDiscoveryPrompts.CandidateItemTemplate;
        for (int i = 0; i <= 5; i++)
            template.Should().Contain($"{{{i}}}");
    }
}
