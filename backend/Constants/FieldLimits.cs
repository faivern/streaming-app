namespace backend.Constants
{
    /// <summary>
    /// Centralized max-length constants for entity fields and database columns.
    /// Used by [MaxLength] data annotations and EF Core HasMaxLength() configurations.
    /// </summary>
    public static class FieldLimits
    {
        // Short string fields (media type codes, date strings)
        public const int MediaTypeMaxLength = 10;
        public const int DateStringMaxLength = 10;

        // Display name and URL fields
        public const int DisplayNameMaxLength = 100;
        public const int UrlPathMaxLength = 500;

        // Content fields
        public const int ListNameMaxLength = 200;
        public const int OverviewMaxLength = 2000;
        public const int ListDescriptionMaxLength = 2000;
        public const int ReviewContentMaxLength = 10000;
    }
}
