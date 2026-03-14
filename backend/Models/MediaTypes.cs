namespace backend.Models
{
    public static class MediaTypes
    {
        public const string Movie = "movie";
        public const string Tv = "tv";

        public static bool IsValid(string mediaType) =>
            mediaType == Movie || mediaType == Tv;
    }
}
