namespace backend.Models
{
    public class TmdbVideoResponse
    {
        public int id { get; set; }
        public List<TmdbVideo> results { get; set; }
    }

    public class TmdbVideo
    {
        public string name { get; set; }
        public string key { get; set; }
        public string site { get; set; }
        public string type { get; set; }
        public bool official { get; set; }
    }
}
