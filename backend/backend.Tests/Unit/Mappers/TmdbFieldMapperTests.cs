using backend.Models.Entities;
using backend.Models.Tmdb;
using backend.Services.Tmdb;
using FluentAssertions;

namespace backend.Tests.Unit.Mappers;

public class TmdbFieldMapperTests
{
    // ── ApplyMovieDetails ───────────────────────────────────────────────

    [Fact]
    public void ApplyMovieDetails_MapsAllFields_ToMediaEntry()
    {
        var target = new MediaEntry();
        var details = new TmdbMovieDetails
        {
            Title = "Inception",
            PosterPath = "/poster.jpg",
            BackdropPath = "/backdrop.jpg",
            Overview = "A mind-bending thriller",
            VoteAverage = 8.4,
            Runtime = 148,
            ReleaseDate = "2010-07-16"
        };

        var before = DateTime.UtcNow;
        TmdbFieldMapper.ApplyMovieDetails(target, details);
        var after = DateTime.UtcNow;

        target.Title.Should().Be("Inception");
        target.PosterPath.Should().Be("/poster.jpg");
        target.BackdropPath.Should().Be("/backdrop.jpg");
        target.Overview.Should().Be("A mind-bending thriller");
        target.VoteAverage.Should().Be(8.4);
        target.Runtime.Should().Be(148);
        target.ReleaseDate.Should().Be("2010-07-16");

        // TV-specific fields should be nulled
        target.FirstAirDate.Should().BeNull();
        target.NumberOfSeasons.Should().BeNull();
        target.NumberOfEpisodes.Should().BeNull();

        // LastTmdbSync should be close to now
        target.LastTmdbSync.Should().BeOnOrAfter(before);
        target.LastTmdbSync.Should().BeOnOrBefore(after);
    }

    [Fact]
    public void ApplyMovieDetails_MapsAllFields_ToListItem()
    {
        var target = new ListItem();
        var details = new TmdbMovieDetails
        {
            Title = "The Matrix",
            PosterPath = "/matrix.jpg",
            BackdropPath = "/matrix_bg.jpg",
            Overview = "A computer hacker...",
            VoteAverage = 8.7,
            Runtime = 136,
            ReleaseDate = "1999-03-31"
        };

        TmdbFieldMapper.ApplyMovieDetails(target, details);

        target.Title.Should().Be("The Matrix");
        target.Runtime.Should().Be(136);
        target.FirstAirDate.Should().BeNull();
        target.NumberOfSeasons.Should().BeNull();
        target.NumberOfEpisodes.Should().BeNull();
    }

    [Fact]
    public void ApplyMovieDetails_NullsTvFields_WhenPreviouslySet()
    {
        var target = new MediaEntry
        {
            FirstAirDate = "2020-01-01",
            NumberOfSeasons = 3,
            NumberOfEpisodes = 30
        };
        var details = new TmdbMovieDetails { Title = "Movie" };

        TmdbFieldMapper.ApplyMovieDetails(target, details);

        target.FirstAirDate.Should().BeNull();
        target.NumberOfSeasons.Should().BeNull();
        target.NumberOfEpisodes.Should().BeNull();
    }

    // ── ApplyTvDetails ──────────────────────────────────────────────────

    [Fact]
    public void ApplyTvDetails_MapsAllFields_ToMediaEntry()
    {
        var target = new MediaEntry();
        var details = new TmdbTvDetails
        {
            Name = "Breaking Bad",
            PosterPath = "/bb_poster.jpg",
            BackdropPath = "/bb_bg.jpg",
            Overview = "A chemistry teacher...",
            VoteAverage = 9.5,
            FirstAirDate = "2008-01-20",
            NumberOfSeasons = 5,
            NumberOfEpisodes = 62
        };

        var before = DateTime.UtcNow;
        TmdbFieldMapper.ApplyTvDetails(target, details);
        var after = DateTime.UtcNow;

        target.Title.Should().Be("Breaking Bad"); // Name → Title
        target.PosterPath.Should().Be("/bb_poster.jpg");
        target.BackdropPath.Should().Be("/bb_bg.jpg");
        target.Overview.Should().Be("A chemistry teacher...");
        target.VoteAverage.Should().Be(9.5);
        target.FirstAirDate.Should().Be("2008-01-20");
        target.NumberOfSeasons.Should().Be(5);
        target.NumberOfEpisodes.Should().Be(62);

        // Movie-specific fields should be nulled
        target.Runtime.Should().BeNull();
        target.ReleaseDate.Should().BeNull();

        target.LastTmdbSync.Should().BeOnOrAfter(before);
        target.LastTmdbSync.Should().BeOnOrBefore(after);
    }

    [Fact]
    public void ApplyTvDetails_NullsMovieFields_WhenPreviouslySet()
    {
        var target = new MediaEntry
        {
            Runtime = 120,
            ReleaseDate = "2020-06-15"
        };
        var details = new TmdbTvDetails { Name = "Show" };

        TmdbFieldMapper.ApplyTvDetails(target, details);

        target.Runtime.Should().BeNull();
        target.ReleaseDate.Should().BeNull();
    }

    [Fact]
    public void ApplyTvDetails_WorksWithListItem()
    {
        var target = new ListItem();
        var details = new TmdbTvDetails
        {
            Name = "Stranger Things",
            NumberOfSeasons = 4,
            NumberOfEpisodes = 34
        };

        TmdbFieldMapper.ApplyTvDetails(target, details);

        target.Title.Should().Be("Stranger Things");
        target.NumberOfSeasons.Should().Be(4);
        target.NumberOfEpisodes.Should().Be(34);
        target.Runtime.Should().BeNull();
        target.ReleaseDate.Should().BeNull();
    }
}
