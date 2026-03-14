using backend.Models;

namespace backend.Services
{
    public static class TmdbFieldMapper
    {
        public static void ApplyMovieDetails(ITmdbSyncable target, TmdbMovieDetails details)
        {
            target.Title = details.Title;
            target.PosterPath = details.PosterPath;
            target.BackdropPath = details.BackdropPath;
            target.Overview = details.Overview;
            target.VoteAverage = details.VoteAverage;
            target.Runtime = details.Runtime;
            target.ReleaseDate = details.ReleaseDate;
            target.FirstAirDate = null;
            target.NumberOfSeasons = null;
            target.NumberOfEpisodes = null;
            target.LastTmdbSync = DateTime.UtcNow;
        }

        public static void ApplyTvDetails(ITmdbSyncable target, TmdbTvDetails details)
        {
            target.Title = details.Name;
            target.PosterPath = details.PosterPath;
            target.BackdropPath = details.BackdropPath;
            target.Overview = details.Overview;
            target.VoteAverage = details.VoteAverage;
            target.Runtime = null;
            target.ReleaseDate = null;
            target.FirstAirDate = details.FirstAirDate;
            target.NumberOfSeasons = details.NumberOfSeasons;
            target.NumberOfEpisodes = details.NumberOfEpisodes;
            target.LastTmdbSync = DateTime.UtcNow;
        }
    }
}
