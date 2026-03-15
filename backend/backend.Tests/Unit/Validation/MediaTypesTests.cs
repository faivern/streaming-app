using backend.Models.Enums;
using FluentAssertions;

namespace backend.Tests.Unit.Validation;

public class MediaTypesTests
{
    [Theory]
    [InlineData("movie", true)]
    [InlineData("tv", true)]
    [InlineData("Movie", false)]
    [InlineData("TV", false)]
    [InlineData("Tv", false)]
    [InlineData("MOVIE", false)]
    [InlineData("series", false)]
    [InlineData("", false)]
    [InlineData("anime", false)]
    public void IsValid_ReturnsExpectedResult(string mediaType, bool expected)
    {
        MediaTypes.IsValid(mediaType).Should().Be(expected);
    }
}
