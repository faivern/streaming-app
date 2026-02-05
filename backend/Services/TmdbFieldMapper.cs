using backend.Models;

namespace backend.Services
{
    public static class TmdbFieldMapper
    {
        public static void ApplyMovieDetails(MediaEntry entry, TmdbMovieDetails details)
        {
            entry.Title = details.Title;
            entry.PosterPath = details.PosterPath;
            entry.BackdropPath = details.BackdropPath;
            entry.Overview = details.Overview;
            entry.VoteAverage = details.VoteAverage;
            entry.Runtime = details.Runtime;
            entry.ReleaseDate = details.ReleaseDate;
            entry.FirstAirDate = null;
            entry.NumberOfSeasons = null;
            entry.NumberOfEpisodes = null;
            entry.LastTmdbSync = DateTime.UtcNow;
        }

        public static void ApplyMovieDetails(ListItem item, TmdbMovieDetails details)
        {
            item.Title = details.Title;
            item.PosterPath = details.PosterPath;
            item.BackdropPath = details.BackdropPath;
            item.Overview = details.Overview;
            item.VoteAverage = details.VoteAverage;
            item.Runtime = details.Runtime;
            item.ReleaseDate = details.ReleaseDate;
            item.FirstAirDate = null;
            item.NumberOfSeasons = null;
            item.NumberOfEpisodes = null;
            item.LastTmdbSync = DateTime.UtcNow;
        }

        public static void ApplyTvDetails(MediaEntry entry, TmdbTvDetails details)
        {
            entry.Title = details.Name;
            entry.PosterPath = details.PosterPath;
            entry.BackdropPath = details.BackdropPath;
            entry.Overview = details.Overview;
            entry.VoteAverage = details.VoteAverage;
            entry.Runtime = null;
            entry.ReleaseDate = null;
            entry.FirstAirDate = details.FirstAirDate;
            entry.NumberOfSeasons = details.NumberOfSeasons;
            entry.NumberOfEpisodes = details.NumberOfEpisodes;
            entry.LastTmdbSync = DateTime.UtcNow;
        }

        public static void ApplyTvDetails(ListItem item, TmdbTvDetails details)
        {
            item.Title = details.Name;
            item.PosterPath = details.PosterPath;
            item.BackdropPath = details.BackdropPath;
            item.Overview = details.Overview;
            item.VoteAverage = details.VoteAverage;
            item.Runtime = null;
            item.ReleaseDate = null;
            item.FirstAirDate = details.FirstAirDate;
            item.NumberOfSeasons = details.NumberOfSeasons;
            item.NumberOfEpisodes = details.NumberOfEpisodes;
            item.LastTmdbSync = DateTime.UtcNow;
        }
    }
}
