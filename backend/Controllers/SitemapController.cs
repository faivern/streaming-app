using System.Text;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    public class SitemapController : ControllerBase
    {
        private readonly string _siteUrl;

        private static readonly XNamespace SitemapNs = "http://www.sitemaps.org/schemas/sitemap/0.9";

        public SitemapController(IConfiguration configuration)
        {
            _siteUrl = (configuration["SiteUrl"] ?? "https://cinelas.com").TrimEnd('/');
        }

        [HttpGet("/sitemap.xml")]
        [ResponseCache(Duration = 86400)]
        public IActionResult GetSitemap()
        {
            var urls = GetStaticUrls();

            var doc = new XDocument(
                new XDeclaration("1.0", "UTF-8", null),
                new XElement(SitemapNs + "urlset",
                    urls.Select(u => new XElement(SitemapNs + "url",
                        new XElement(SitemapNs + "loc", u.Loc),
                        new XElement(SitemapNs + "changefreq", u.ChangeFreq),
                        new XElement(SitemapNs + "priority", u.Priority.ToString("F1"))
                    ))
                )
            );

            return Content(doc.Declaration + "\n" + doc, "application/xml", Encoding.UTF8);
        }

        private List<SitemapUrl> GetStaticUrls()
        {
            return new List<SitemapUrl>
            {
                // Main pages
                new($"{_siteUrl}/", "daily", 1.0),

                // Browse pages
                new($"{_siteUrl}/providers", "weekly", 0.7),

                // Genre pages (TMDB genre IDs) — SEO-friendly with slug and media type
                new($"{_siteUrl}/genre/28-action/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/12-adventure/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/16-animation/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/35-comedy/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/80-crime/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/99-documentary/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/18-drama/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/10751-family/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/14-fantasy/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/36-history/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/27-horror/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/10402-music/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/9648-mystery/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/10749-romance/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/878-science-fiction/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/10770-tv-movie/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/53-thriller/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/10752-war/movie", "weekly", 0.6),
                new($"{_siteUrl}/genre/37-western/movie", "weekly", 0.6),

                // Legal pages
                new($"{_siteUrl}/privacy-policy", "monthly", 0.3),
                new($"{_siteUrl}/terms-of-service", "monthly", 0.3),
            };
        }

        private record SitemapUrl(string Loc, string ChangeFreq, double Priority);
    }
}
