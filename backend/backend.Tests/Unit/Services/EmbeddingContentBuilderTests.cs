using backend.Models.Tmdb;
using backend.Services;
using FluentAssertions;

namespace backend.Tests.Unit.Services;

public class EmbeddingContentBuilderTests
{
    // ------- Helpers -------

    private static TmdbMovieDetails GroundhogDayDetails() => new TmdbMovieDetails
    {
        Title = "Groundhog Day",
        ReleaseDate = "1993-02-12",
        Overview = "A weatherman finds himself inexplicably living the same day over and over again.",
        VoteAverage = 8.0,
        Genres = new List<TmdbGenre>
        {
            new() { Id = 35, Name = "Comedy" },
            new() { Id = 10749, Name = "Romance" },
            new() { Id = 14, Name = "Fantasy" },
        },
        Credits = new TmdbCredits
        {
            Crew = new List<TmdbCrewMember>
            {
                new() { Name = "Harold Ramis", Job = "Director" },
                new() { Name = "Someone Else", Job = "Producer" },
            },
            Cast = new List<TmdbCastMember>
            {
                new() { Name = "Bill Murray", Order = 0 },
                new() { Name = "Andie MacDowell", Order = 1 },
                new() { Name = "Chris Elliott", Order = 2 },
                new() { Name = "Stephen Tobolowsky", Order = 3 },
                new() { Name = "Brian Doyle-Murray", Order = 4 },
            }
        },
        Keywords = new TmdbKeywordsMovie
        {
            Keywords = new List<TmdbKeyword>
            {
                new() { Id = 1, Name = "time loop" },
                new() { Id = 2, Name = "weather" },
                new() { Id = 3, Name = "self improvement" },
            }
        }
    };

    private static TmdbTvDetails BreakingBadDetails() => new TmdbTvDetails
    {
        Name = "Breaking Bad",
        FirstAirDate = "2008-01-20",
        LastAirDate = "2013-09-29",
        Overview = "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing methamphetamine.",
        VoteAverage = 8.9,
        NumberOfSeasons = 5,
        Status = "Ended",
        Genres = new List<TmdbGenre>
        {
            new() { Id = 80, Name = "Crime" },
            new() { Id = 18, Name = "Drama" },
            new() { Id = 53, Name = "Thriller" },
        },
        Networks = new List<TmdbNetwork>
        {
            new() { Name = "AMC" }
        },
        CreatedBy = new List<TmdbCreator>
        {
            new() { Name = "Vince Gilligan" }
        },
        Credits = new TmdbCredits
        {
            Cast = new List<TmdbCastMember>
            {
                new() { Name = "Bryan Cranston", Order = 0 },
                new() { Name = "Aaron Paul", Order = 1 },
                new() { Name = "Anna Gunn", Order = 2 },
                new() { Name = "Dean Norris", Order = 3 },
                new() { Name = "Betsy Brandt", Order = 4 },
            }
        },
        Keywords = new TmdbKeywordsTv
        {
            Results = new List<TmdbKeyword>
            {
                new() { Id = 1, Name = "drug trade" },
                new() { Id = 2, Name = "cancer" },
                new() { Id = 3, Name = "teacher" },
            }
        }
    };

    // ------- Movie Tests -------

    [Fact]
    public void BuildMovieText_FullData_ProducesGroundhogDayProse()
    {
        var details = GroundhogDayDetails();

        var result = EmbeddingContentBuilder.BuildMovieText(details);

        result.Should().Be(
            "Groundhog Day (1993) is a Comedy, Romance, Fantasy film directed by Harold Ramis, starring Bill Murray, Andie MacDowell, Chris Elliott, Stephen Tobolowsky, Brian Doyle-Murray. A weatherman finds himself inexplicably living the same day over and over again. Keywords: time loop, weather, self improvement. Rated 8.0/10.");
    }

    [Fact]
    public void BuildMovieText_NullGenres_UsesFallbackFilm()
    {
        var details = new TmdbMovieDetails
        {
            Title = "Test Movie",
            ReleaseDate = "2020-01-01",
            Overview = "An overview.",
            VoteAverage = 7.0,
            Genres = null,
            Credits = GroundhogDayDetails().Credits,
            Keywords = GroundhogDayDetails().Keywords
        };

        var result = EmbeddingContentBuilder.BuildMovieText(details);

        result.Should().Contain("is a film film");
    }

    [Fact]
    public void BuildMovieText_NullCredits_OmitsDirectorAndCast()
    {
        var details = new TmdbMovieDetails
        {
            Title = "Test Movie",
            ReleaseDate = "2020-01-01",
            Overview = "An overview.",
            VoteAverage = 7.0,
            Genres = GroundhogDayDetails().Genres,
            Credits = null,
            Keywords = GroundhogDayDetails().Keywords
        };

        var result = EmbeddingContentBuilder.BuildMovieText(details);

        result.Should().NotContain("directed by");
        result.Should().NotContain("starring");
    }

    [Fact]
    public void BuildMovieText_NullKeywords_OmitsKeywordsLine()
    {
        var details = new TmdbMovieDetails
        {
            Title = "Test Movie",
            ReleaseDate = "2020-01-01",
            Overview = "An overview.",
            VoteAverage = 7.0,
            Genres = GroundhogDayDetails().Genres,
            Credits = GroundhogDayDetails().Credits,
            Keywords = null
        };

        var result = EmbeddingContentBuilder.BuildMovieText(details);

        result.Should().NotContain("Keywords:");
    }

    [Fact]
    public void BuildMovieText_ZeroVoteAverage_OmitsRatedLine()
    {
        var details = new TmdbMovieDetails
        {
            Title = "Test Movie",
            ReleaseDate = "2020-01-01",
            Overview = "An overview.",
            VoteAverage = 0.0,
            Genres = GroundhogDayDetails().Genres,
            Credits = GroundhogDayDetails().Credits,
            Keywords = GroundhogDayDetails().Keywords
        };

        var result = EmbeddingContentBuilder.BuildMovieText(details);

        result.Should().NotContain("Rated");
    }

    [Fact]
    public void BuildMovieText_CastLimitedToTop5_ByOrder()
    {
        var details = new TmdbMovieDetails
        {
            Title = "Test Movie",
            ReleaseDate = "2020-01-01",
            Genres = GroundhogDayDetails().Genres,
            Credits = new TmdbCredits
            {
                Crew = new List<TmdbCrewMember>
                {
                    new() { Name = "A Director", Job = "Director" }
                },
                Cast = new List<TmdbCastMember>
                {
                    new() { Name = "Actor1", Order = 0 },
                    new() { Name = "Actor2", Order = 1 },
                    new() { Name = "Actor3", Order = 2 },
                    new() { Name = "Actor4", Order = 3 },
                    new() { Name = "Actor5", Order = 4 },
                    new() { Name = "Actor6", Order = 5 },
                    new() { Name = "Actor7", Order = 6 },
                    new() { Name = "Actor8", Order = 7 },
                }
            }
        };

        var result = EmbeddingContentBuilder.BuildMovieText(details);

        result.Should().Contain("Actor1");
        result.Should().Contain("Actor5");
        result.Should().NotContain("Actor6");
        result.Should().NotContain("Actor7");
        result.Should().NotContain("Actor8");
    }

    // ------- TV Tests -------

    [Fact]
    public void BuildTvText_FullData_ProducesBreakingBadProse()
    {
        var details = BreakingBadDetails();

        var result = EmbeddingContentBuilder.BuildTvText(details);

        result.Should().Be(
            "Breaking Bad (2008-2013) is a Crime, Drama, Thriller series on AMC, created by Vince Gilligan, starring Bryan Cranston, Aaron Paul, Anna Gunn, Dean Norris, Betsy Brandt. 5 seasons. Status: Ended. A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing methamphetamine. Keywords: drug trade, cancer, teacher. Rated 8.9/10.");
    }

    [Fact]
    public void BuildTvText_NullNetworks_OmitsNetworkName()
    {
        var details = new TmdbTvDetails
        {
            Name = "Test Show",
            FirstAirDate = "2010-01-01",
            LastAirDate = "2015-01-01",
            Overview = "An overview.",
            VoteAverage = 7.5,
            NumberOfSeasons = 3,
            Status = "Ended",
            Genres = BreakingBadDetails().Genres,
            Networks = null,
            CreatedBy = BreakingBadDetails().CreatedBy,
            Credits = BreakingBadDetails().Credits,
            Keywords = BreakingBadDetails().Keywords
        };

        var result = EmbeddingContentBuilder.BuildTvText(details);

        result.Should().NotContain(" on ");
    }

    [Fact]
    public void BuildTvText_NullCreatedBy_OmitsCreatorPhrase()
    {
        var details = new TmdbTvDetails
        {
            Name = "Test Show",
            FirstAirDate = "2010-01-01",
            LastAirDate = "2015-01-01",
            Overview = "An overview.",
            VoteAverage = 7.5,
            NumberOfSeasons = 3,
            Status = "Ended",
            Genres = BreakingBadDetails().Genres,
            Networks = BreakingBadDetails().Networks,
            CreatedBy = null,
            Credits = BreakingBadDetails().Credits,
            Keywords = BreakingBadDetails().Keywords
        };

        var result = EmbeddingContentBuilder.BuildTvText(details);

        result.Should().NotContain("created by");
    }
}
