namespace backend.Constants
{
    public static class CacheDurations
    {
        private const int StandardCacheHours = 6;
        private const int WatchProviderCacheHours = 12;
        private const int StaticReferenceCacheHours = 24;

        /// <summary>Standard TMDB API response cache (search, popular, trending, details, etc.)</summary>
        public static readonly TimeSpan Standard = TimeSpan.FromHours(StandardCacheHours);

        /// <summary>Watch provider and collection search cache (longer-lived than standard)</summary>
        public static readonly TimeSpan WatchProvider = TimeSpan.FromHours(WatchProviderCacheHours);

        /// <summary>Rarely-changing reference data: regions, provider lists, collection details</summary>
        public static readonly TimeSpan StaticReference = TimeSpan.FromHours(StaticReferenceCacheHours);
    }
}
