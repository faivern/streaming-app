namespace backend.Constants
{
    /// <summary>
    /// Validation boundaries for API requests and user input.
    /// </summary>
    public static class ValidationLimits
    {
        // TMDB API pagination
        public const int MinPageNumber = 1;
        public const int MaxPageNumber = 500;

        // Vote/rating range
        public const int MinVoteAverage = 0;
        public const int MaxVoteAverage = 10;

        // List name input validation (stricter than DB column limit)
        public const int MaxListNameInputLength = 100;

        // Image file validation
        public const int MinValidImageFileBytes = 4;

        // Rating display precision
        public const int RatingDecimalPlaces = 1;
    }
}
