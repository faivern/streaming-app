namespace backend.Models.Dtos
{
    public class CreateListRequest
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public bool IsPublic { get; set; }
    }

    public class UpdateListRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? IsPublic { get; set; }
    }

    public class AddListItemRequest
    {
        public int TmdbId { get; set; }
        public string MediaType { get; set; } = null!;
        public string? Title { get; set; }
        public string? PosterPath { get; set; }
    }
}
