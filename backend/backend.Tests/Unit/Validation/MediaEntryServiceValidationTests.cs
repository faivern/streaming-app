using backend.Models.Entities;
using backend.Services;
using FluentAssertions;

namespace backend.Tests.Unit.Validation;

public class MediaEntryServiceValidationTests
{
    // ── CalculateAverageRating ──────────────────────────────────────────

    [Fact]
    public void CalculateAverageRating_AllFourRatingsSet_ReturnsAverage()
    {
        var entry = new MediaEntry
        {
            RatingActing = 8,
            RatingStory = 6,
            RatingSoundtrack = 7,
            RatingVisuals = 9
        };

        var result = MediaEntryService.CalculateAverageRating(entry);

        result.Should().Be(7.5);
    }

    [Fact]
    public void CalculateAverageRating_NoRatingsSet_ReturnsNull()
    {
        var entry = new MediaEntry();

        var result = MediaEntryService.CalculateAverageRating(entry);

        result.Should().BeNull();
    }

    [Fact]
    public void CalculateAverageRating_OneRatingSet_ReturnsThatValue()
    {
        var entry = new MediaEntry { RatingActing = 8.5 };

        var result = MediaEntryService.CalculateAverageRating(entry);

        result.Should().Be(8.5);
    }

    [Fact]
    public void CalculateAverageRating_TwoRatingsSet_AveragesOnlyNonNull()
    {
        var entry = new MediaEntry
        {
            RatingActing = 8,
            RatingStory = 6
        };

        var result = MediaEntryService.CalculateAverageRating(entry);

        result.Should().Be(7.0);
    }

    [Fact]
    public void CalculateAverageRating_RoundsToOneDecimalPlace()
    {
        var entry = new MediaEntry
        {
            RatingActing = 7,
            RatingStory = 8,
            RatingSoundtrack = 9
        };

        // (7 + 8 + 9) / 3 = 8.0
        var result = MediaEntryService.CalculateAverageRating(entry);
        result.Should().Be(8.0);

        // Now test actual rounding: (7 + 8 + 6) / 3 = 7.0
        entry.RatingSoundtrack = 6;
        result = MediaEntryService.CalculateAverageRating(entry);
        result.Should().Be(7.0);

        // (3.3 + 6.7 + 9.1) / 3 = 6.366... → 6.4
        entry.RatingActing = 3.3;
        entry.RatingStory = 6.7;
        entry.RatingSoundtrack = 9.1;
        result = MediaEntryService.CalculateAverageRating(entry);
        result.Should().Be(6.4);
    }

    [Fact]
    public void CalculateAverageRating_AllZeros_ReturnsZero()
    {
        var entry = new MediaEntry
        {
            RatingActing = 0,
            RatingStory = 0,
            RatingSoundtrack = 0,
            RatingVisuals = 0
        };

        var result = MediaEntryService.CalculateAverageRating(entry);

        result.Should().Be(0);
    }

    [Fact]
    public void CalculateAverageRating_AllTens_ReturnsTen()
    {
        var entry = new MediaEntry
        {
            RatingActing = 10,
            RatingStory = 10,
            RatingSoundtrack = 10,
            RatingVisuals = 10
        };

        var result = MediaEntryService.CalculateAverageRating(entry);

        result.Should().Be(10);
    }

    // ── ValidateRatings ─────────────────────────────────────────────────

    [Fact]
    public void ValidateRatings_AllNull_ReturnsEmptyList()
    {
        var entry = new MediaEntry();

        var result = MediaEntryService.ValidateRatings(entry);

        result.Should().BeEmpty();
    }

    [Fact]
    public void ValidateRatings_AllWithinRange_ReturnsEmptyList()
    {
        var entry = new MediaEntry
        {
            RatingActing = 5.5,
            RatingStory = 0,
            RatingSoundtrack = 10,
            RatingVisuals = 7.3
        };

        var result = MediaEntryService.ValidateRatings(entry);

        result.Should().BeEmpty();
    }

    [Fact]
    public void ValidateRatings_NegativeValue_ReturnsFieldName()
    {
        var entry = new MediaEntry { RatingActing = -0.1 };

        var result = MediaEntryService.ValidateRatings(entry);

        result.Should().ContainSingle().Which.Should().Be("RatingActing");
    }

    [Fact]
    public void ValidateRatings_OverTen_ReturnsFieldName()
    {
        var entry = new MediaEntry { RatingVisuals = 10.1 };

        var result = MediaEntryService.ValidateRatings(entry);

        result.Should().ContainSingle().Which.Should().Be("RatingVisuals");
    }

    [Fact]
    public void ValidateRatings_NaN_ReturnsFieldName()
    {
        var entry = new MediaEntry { RatingStory = double.NaN };

        var result = MediaEntryService.ValidateRatings(entry);

        result.Should().ContainSingle().Which.Should().Be("RatingStory");
    }

    [Fact]
    public void ValidateRatings_Infinity_ReturnsFieldName()
    {
        var entry = new MediaEntry { RatingSoundtrack = double.PositiveInfinity };

        var result = MediaEntryService.ValidateRatings(entry);

        result.Should().ContainSingle().Which.Should().Be("RatingSoundtrack");
    }

    [Fact]
    public void ValidateRatings_NegativeInfinity_ReturnsFieldName()
    {
        var entry = new MediaEntry { RatingSoundtrack = double.NegativeInfinity };

        var result = MediaEntryService.ValidateRatings(entry);

        result.Should().ContainSingle().Which.Should().Be("RatingSoundtrack");
    }

    [Fact]
    public void ValidateRatings_BoundaryZeroIsValid()
    {
        var entry = new MediaEntry { RatingActing = 0.0 };

        var result = MediaEntryService.ValidateRatings(entry);

        result.Should().BeEmpty();
    }

    [Fact]
    public void ValidateRatings_BoundaryTenIsValid()
    {
        var entry = new MediaEntry { RatingActing = 10.0 };

        var result = MediaEntryService.ValidateRatings(entry);

        result.Should().BeEmpty();
    }

    [Fact]
    public void ValidateRatings_MultipleInvalid_ReturnsAllFieldNames()
    {
        var entry = new MediaEntry
        {
            RatingActing = -1,
            RatingStory = 5,
            RatingSoundtrack = double.NaN,
            RatingVisuals = 11
        };

        var result = MediaEntryService.ValidateRatings(entry);

        result.Should().HaveCount(3);
        result.Should().Contain("RatingActing");
        result.Should().Contain("RatingSoundtrack");
        result.Should().Contain("RatingVisuals");
    }

    // ── ValidateText ────────────────────────────────────────────────────

    [Fact]
    public void ValidateText_Null_ReturnsTrue()
    {
        MediaEntryService.ValidateText(null).Should().BeTrue();
    }

    [Fact]
    public void ValidateText_Empty_ReturnsTrue()
    {
        MediaEntryService.ValidateText("").Should().BeTrue();
    }

    [Fact]
    public void ValidateText_UnderLimit_ReturnsTrue()
    {
        MediaEntryService.ValidateText("A great movie!").Should().BeTrue();
    }

    [Fact]
    public void ValidateText_AtLimit_ReturnsTrue()
    {
        var text = new string('x', MediaEntryService.ReviewTextMax);
        MediaEntryService.ValidateText(text).Should().BeTrue();
    }

    [Fact]
    public void ValidateText_OverLimit_ReturnsFalse()
    {
        var text = new string('x', MediaEntryService.ReviewTextMax + 1);
        MediaEntryService.ValidateText(text).Should().BeFalse();
    }
}
