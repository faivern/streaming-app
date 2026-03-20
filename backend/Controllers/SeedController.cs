using backend.Data;
using backend.Models.Entities;
using backend.Models.Enums;
using backend.Services.Tmdb;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/dev")]
    [Authorize]
    public class SeedController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ITmdbService _tmdbService;
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<SeedController> _logger;

        private const string SeedMarker = "[SEED]";

        public SeedController(
            AppDbContext db,
            ITmdbService tmdbService,
            IWebHostEnvironment env,
            ILogger<SeedController> logger)
        {
            _db = db;
            _tmdbService = tmdbService;
            _env = env;
            _logger = logger;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

        // All TMDB IDs used in seed data — used for cleanup
        private static readonly HashSet<int> SeedMovieIds = new()
        {
            27205, 157336, 603, 335984, 438631, 329865, // Sci-Fi
            278, 238, 680, 550, 6977, 7345, 1422,       // Classic
            496243, 129, 545611, 120467, 376867, 391713, // Award Winners
            244786, 419430, 76341, 37799                 // Award Winners cont.
        };

        private static readonly HashSet<int> SeedTvIds = new()
        {
            70523, 95396,                                         // Sci-Fi
            1396, 66732, 1399, 136315, 94605, 93405, 87108, 100088 // TV Binge
        };

        #region Seed Data Definitions

        private record SeedListDef(string Name, string Description, SeedItemDef[] Items);
        private record SeedItemDef(int TmdbId, string MediaType, int MonthsAgo);
        private record SeedEntryDef(
            int TmdbId, string MediaType, WatchStatus Status,
            double? Acting, double? Story, double? Soundtrack, double? Visuals,
            int MonthsAgo, string? ReviewText);

        private static SeedListDef[] GetListDefinitions() => new[]
        {
            new SeedListDef("Sci-Fi Favorites", $"{SeedMarker} Mind-bending sci-fi that pushes the boundaries of imagination", new[]
            {
                new SeedItemDef(27205,  MediaTypes.Movie, 1),  // Inception
                new SeedItemDef(157336, MediaTypes.Movie, 1),  // Interstellar
                new SeedItemDef(603,    MediaTypes.Movie, 2),  // The Matrix
                new SeedItemDef(335984, MediaTypes.Movie, 3),  // Blade Runner 2049
                new SeedItemDef(438631, MediaTypes.Movie, 4),  // Dune
                new SeedItemDef(329865, MediaTypes.Movie, 5),  // Arrival
                new SeedItemDef(70523,  MediaTypes.Tv,    1),  // Dark
                new SeedItemDef(95396,  MediaTypes.Tv,    1),  // Severance
            }),
            new SeedListDef("Classic Cinema", $"{SeedMarker} Timeless masterpieces of filmmaking", new[]
            {
                new SeedItemDef(278,  MediaTypes.Movie, 6),  // Shawshank
                new SeedItemDef(238,  MediaTypes.Movie, 7),  // Godfather
                new SeedItemDef(680,  MediaTypes.Movie, 3),  // Pulp Fiction
                new SeedItemDef(550,  MediaTypes.Movie, 4),  // Fight Club
                new SeedItemDef(6977, MediaTypes.Movie, 5),  // No Country
                new SeedItemDef(7345, MediaTypes.Movie, 8),  // There Will Be Blood
                new SeedItemDef(1422, MediaTypes.Movie, 9),  // The Departed
            }),
            new SeedListDef("TV Binge", $"{SeedMarker} Must-watch shows for marathon viewing", new[]
            {
                new SeedItemDef(1396,   MediaTypes.Tv, 1),  // Breaking Bad
                new SeedItemDef(66732,  MediaTypes.Tv, 1),  // Stranger Things
                new SeedItemDef(1399,   MediaTypes.Tv, 2),  // Game of Thrones
                new SeedItemDef(136315, MediaTypes.Tv, 1),  // The Bear
                new SeedItemDef(94605,  MediaTypes.Tv, 3),  // Arcane
                new SeedItemDef(93405,  MediaTypes.Tv, 4),  // Squid Game
                new SeedItemDef(87108,  MediaTypes.Tv, 5),  // Chernobyl
                new SeedItemDef(100088, MediaTypes.Tv, 1),  // Last of Us
            }),
            new SeedListDef("Award Winners", $"{SeedMarker} Oscar and festival picks that redefined cinema", new[]
            {
                new SeedItemDef(496243, MediaTypes.Movie, 2),  // Parasite
                new SeedItemDef(129,    MediaTypes.Movie, 6),  // Spirited Away
                new SeedItemDef(545611, MediaTypes.Movie, 1),  // EEAAO
                new SeedItemDef(120467, MediaTypes.Movie, 5),  // Grand Budapest
                new SeedItemDef(376867, MediaTypes.Movie, 7),  // Moonlight
                new SeedItemDef(391713, MediaTypes.Movie, 4),  // Lady Bird
                new SeedItemDef(244786, MediaTypes.Movie, 3),  // Whiplash
                new SeedItemDef(419430, MediaTypes.Movie, 2),  // Get Out
                new SeedItemDef(76341,  MediaTypes.Movie, 1),  // Mad Max Fury Road
                new SeedItemDef(37799,  MediaTypes.Movie, 8),  // Social Network
            }),
        };

        private static SeedEntryDef[] GetEntryDefinitions() => new[]
        {
            // Watched with full ratings + reviews
            new SeedEntryDef(27205,  MediaTypes.Movie, WatchStatus.Watched, 9.0, 9.5, 9.5, 9.0, 1,
                "A masterclass in layered storytelling. Nolan weaves dream logic into a heist thriller that rewards every rewatch."),
            new SeedEntryDef(157336, MediaTypes.Movie, WatchStatus.Watched, 8.5, 9.0, 10.0, 9.5, 1,
                "Hans Zimmer's organ score alone is worth the price of admission. The docking scene is peak cinema."),
            new SeedEntryDef(603,    MediaTypes.Movie, WatchStatus.Watched, 8.0, 9.0, 8.5, 9.0, 2,
                "Still holds up. The philosophical underpinnings elevate what could have been a simple action movie."),
            new SeedEntryDef(278,    MediaTypes.Movie, WatchStatus.Watched, 10.0, 10.0, 8.5, 8.0, 6,
                "The definitive prison drama. Tim Robbins and Morgan Freeman deliver career-best performances."),
            new SeedEntryDef(238,    MediaTypes.Movie, WatchStatus.Watched, 10.0, 10.0, 9.0, 9.0, 7,
                "The definitive crime saga."),
            new SeedEntryDef(680,    MediaTypes.Movie, WatchStatus.Watched, 9.5, 9.5, 9.0, 8.5, 3, null),
            new SeedEntryDef(550,    MediaTypes.Movie, WatchStatus.Watched, 9.0, 8.5, 8.0, 8.0, 4, null),
            new SeedEntryDef(496243, MediaTypes.Movie, WatchStatus.Watched, 9.5, 10.0, 8.5, 9.0, 2,
                "Bong Joon-ho crafted a genre-defying film. The tonal shifts between comedy and horror are seamless."),
            new SeedEntryDef(545611, MediaTypes.Movie, WatchStatus.Watched, 9.0, 9.5, 8.0, 9.5, 1,
                "Somehow makes the multiverse feel deeply personal. Michelle Yeoh deserved every award."),
            new SeedEntryDef(244786, MediaTypes.Movie, WatchStatus.Watched, 9.5, 8.5, 10.0, 8.0, 3,
                "J.K. Simmons is terrifying. The final drum solo is one of the most intense sequences ever filmed."),
            new SeedEntryDef(335984, MediaTypes.Movie, WatchStatus.Watched, 8.0, 8.5, 9.5, 10.0, 3, null),
            new SeedEntryDef(438631, MediaTypes.Movie, WatchStatus.Watched, 8.5, 8.0, 9.0, 10.0, 4, null),
            new SeedEntryDef(329865, MediaTypes.Movie, WatchStatus.Watched, 8.5, 9.5, 8.0, 8.5, 5, null),
            new SeedEntryDef(419430, MediaTypes.Movie, WatchStatus.Watched, 9.0, 9.0, 7.5, 8.0, 2,
                "Jordan Peele turned social commentary into genuine horror. A landmark debut."),
            new SeedEntryDef(76341,  MediaTypes.Movie, WatchStatus.Watched, 8.0, 7.5, 8.5, 10.0, 1, null),

            // Watched with partial ratings (no soundtrack)
            new SeedEntryDef(6977,  MediaTypes.Movie, WatchStatus.Watched, 9.0, 9.5, null, 9.0, 5, null),
            new SeedEntryDef(7345,  MediaTypes.Movie, WatchStatus.Watched, 10.0, 9.0, null, 9.5, 8,
                "Daniel Day-Lewis is mesmerizing. 'I drink your milkshake' lives rent-free in my head."),

            // Watching (TV shows, no ratings)
            new SeedEntryDef(1396,   MediaTypes.Tv, WatchStatus.Watching, null, null, null, null, 1, null),
            new SeedEntryDef(136315, MediaTypes.Tv, WatchStatus.Watching, null, null, null, null, 1, null),
            new SeedEntryDef(100088, MediaTypes.Tv, WatchStatus.Watching, null, null, null, null, 1, null),

            // WantToWatch (no ratings, no reviews)
            new SeedEntryDef(129,    MediaTypes.Movie, WatchStatus.WantToWatch, null, null, null, null, 6, null),
            new SeedEntryDef(120467, MediaTypes.Movie, WatchStatus.WantToWatch, null, null, null, null, 5, null),
            new SeedEntryDef(376867, MediaTypes.Movie, WatchStatus.WantToWatch, null, null, null, null, 7, null),
            new SeedEntryDef(391713, MediaTypes.Movie, WatchStatus.WantToWatch, null, null, null, null, 4, null),
            new SeedEntryDef(37799,  MediaTypes.Movie, WatchStatus.WantToWatch, null, null, null, null, 8, null),
        };

        #endregion

        [HttpPost("seed")]
        public async Task<IActionResult> Seed()
        {
            if (!_env.IsDevelopment())
                return NotFound();

            var userId = GetUserId();
            _logger.LogInformation("Seeding dev data for user {UserId}", userId);

            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                // --- CLEANUP existing seed data ---
                var existingLists = await _db.Lists
                    .Include(l => l.Items)
                    .Where(l => l.UserId == userId && l.Description != null && l.Description.Contains(SeedMarker))
                    .ToListAsync();
                _db.Lists.RemoveRange(existingLists);

                var allSeedTmdbIds = SeedMovieIds.Union(SeedTvIds).ToList();
                var existingEntries = await _db.MediaEntries
                    .Include(e => e.Review)
                    .Where(e => e.UserId == userId && allSeedTmdbIds.Contains(e.TmdbId))
                    .ToListAsync();
                _db.MediaEntries.RemoveRange(existingEntries);

                await _db.SaveChangesAsync();

                // --- CREATE LISTS + ITEMS ---
                var listDefs = GetListDefinitions();
                var now = DateTime.UtcNow;
                int itemsCreated = 0;

                foreach (var listDef in listDefs)
                {
                    var list = new Models.Entities.List
                    {
                        UserId = userId,
                        Name = listDef.Name,
                        Description = listDef.Description,
                        IsPublic = false,
                        CreatedAt = now.AddMonths(-9),
                        UpdatedAt = now
                    };

                    foreach (var itemDef in listDef.Items)
                    {
                        var item = new ListItem
                        {
                            MediaType = itemDef.MediaType,
                            TmdbId = itemDef.TmdbId,
                            AddedAt = now.AddMonths(-itemDef.MonthsAgo)
                        };

                        // Fetch TMDB details and apply field mapping
                        if (itemDef.MediaType == MediaTypes.Movie)
                        {
                            var details = await _tmdbService.GetMovieDetailsTypedAsync(itemDef.TmdbId);
                            if (details is not null) TmdbFieldMapper.ApplyMovieDetails(item, details);
                        }
                        else
                        {
                            var details = await _tmdbService.GetTvDetailsTypedAsync(itemDef.TmdbId);
                            if (details is not null) TmdbFieldMapper.ApplyTvDetails(item, details);
                        }

                        list.Items.Add(item);
                        itemsCreated++;
                    }

                    _db.Lists.Add(list);
                }

                // --- CREATE MEDIA ENTRIES + REVIEWS ---
                var entryDefs = GetEntryDefinitions();
                int entriesCreated = 0;
                int reviewsCreated = 0;

                foreach (var def in entryDefs)
                {
                    var createdAt = now.AddMonths(-def.MonthsAgo).AddDays(-2);
                    var watchedAt = def.Status == WatchStatus.Watched
                        ? now.AddMonths(-def.MonthsAgo)
                        : (DateTime?)null;

                    var entry = new MediaEntry
                    {
                        UserId = userId,
                        TmdbId = def.TmdbId,
                        MediaType = def.MediaType,
                        Status = def.Status,
                        RatingActing = def.Acting,
                        RatingStory = def.Story,
                        RatingSoundtrack = def.Soundtrack,
                        RatingVisuals = def.Visuals,
                        CreatedAt = createdAt,
                        UpdatedAt = now,
                        WatchedAt = watchedAt
                    };

                    // Fetch TMDB details
                    if (def.MediaType == MediaTypes.Movie)
                    {
                        var details = await _tmdbService.GetMovieDetailsTypedAsync(def.TmdbId);
                        if (details is not null) TmdbFieldMapper.ApplyMovieDetails(entry, details);
                    }
                    else
                    {
                        var details = await _tmdbService.GetTvDetailsTypedAsync(def.TmdbId);
                        if (details is not null) TmdbFieldMapper.ApplyTvDetails(entry, details);
                    }

                    // Attach review if defined
                    if (def.ReviewText is not null)
                    {
                        entry.Review = new Review
                        {
                            Content = def.ReviewText,
                            CreatedAt = watchedAt ?? createdAt,
                            UpdatedAt = watchedAt ?? createdAt
                        };
                        reviewsCreated++;
                    }

                    _db.MediaEntries.Add(entry);
                    entriesCreated++;
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation(
                    "Seed complete: {Lists} lists, {Items} items, {Entries} entries, {Reviews} reviews",
                    listDefs.Length, itemsCreated, entriesCreated, reviewsCreated);

                return Ok(new
                {
                    listsCreated = listDefs.Length,
                    itemsCreated,
                    entriesCreated,
                    reviewsCreated
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Seed failed for user {UserId}", userId);
                throw;
            }
        }

        [HttpDelete("seed")]
        public async Task<IActionResult> CleanSeed()
        {
            if (!_env.IsDevelopment())
                return NotFound();

            var userId = GetUserId();
            _logger.LogInformation("Cleaning seed data for user {UserId}", userId);

            // Remove seed lists (cascade deletes ListItems)
            var seedLists = await _db.Lists
                .Where(l => l.UserId == userId && l.Description != null && l.Description.Contains(SeedMarker))
                .ToListAsync();
            _db.Lists.RemoveRange(seedLists);

            // Remove seed media entries (cascade deletes Reviews)
            var allSeedTmdbIds = SeedMovieIds.Union(SeedTvIds).ToList();
            var seedEntries = await _db.MediaEntries
                .Where(e => e.UserId == userId && allSeedTmdbIds.Contains(e.TmdbId))
                .ToListAsync();
            _db.MediaEntries.RemoveRange(seedEntries);

            await _db.SaveChangesAsync();

            _logger.LogInformation("Cleaned {Lists} lists, {Entries} entries", seedLists.Count, seedEntries.Count);
            return NoContent();
        }
    }
}
