using backend.Constants;
using backend.Models.Entities;
using backend.Models.Enums;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Pgvector.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<MediaEntry> MediaEntries => Set<MediaEntry>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<List> Lists => Set<List>();
        public DbSet<ListItem> ListItems => Set<ListItem>();
        public DbSet<MovieEmbedding> MovieEmbeddings => Set<MovieEmbedding>();
        public DbSet<AiQueryLog> AiQueryLogs => Set<AiQueryLog>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            var isNpgsql = Database.ProviderName?.Contains("Npgsql") == true;

            if (isNpgsql)
                builder.HasPostgresExtension("vector");

            builder.Entity<AppUser>(entity =>
            {
                entity.Property(u => u.DisplayName).HasMaxLength(FieldLimits.DisplayNameMaxLength);
                entity.Property(u => u.AvatarUrl).HasMaxLength(FieldLimits.UrlPathMaxLength);
            });

            // MediaEntry configuration
            builder.Entity<MediaEntry>(entity =>
            {
                entity.ToTable("MediaEntries");

                // Prevent duplicate entries (same user + same media)
                entity.HasIndex(e => new { e.UserId, e.TmdbId, e.MediaType }).IsUnique();

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Default value for Status
                entity.Property(e => e.Status)
                    .HasDefaultValue(WatchStatus.WantToWatch);

                entity.Property(e => e.BackdropPath).HasMaxLength(FieldLimits.UrlPathMaxLength);
                entity.Property(e => e.Overview).HasMaxLength(FieldLimits.OverviewMaxLength);
            });

            // Review configuration - 1:1 relationship with MediaEntry
            builder.Entity<Review>(entity =>
            {
                // Enforce 1:1 relationship via unique index
                entity.HasIndex(r => r.MediaEntryId).IsUnique();

                entity.HasOne(r => r.MediaEntry)
                    .WithOne(e => e.Review)
                    .HasForeignKey<Review>(r => r.MediaEntryId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(r => r.Content).HasMaxLength(FieldLimits.ReviewContentMaxLength);
            });

            // List configuration
            builder.Entity<List>(entity =>
            {
                entity.ToTable("Lists");

                entity.HasOne(c => c.User)
                    .WithMany()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(c => c.IsPublic).HasDefaultValue(false);
                entity.Property(c => c.ThumbnailPath).HasMaxLength(FieldLimits.UrlPathMaxLength);
            });

            // ListItem configuration
            builder.Entity<ListItem>(entity =>
            {
                entity.ToTable("ListItems");

                // Prevent duplicate items in same list
                entity.HasIndex(ci => new { ci.ListId, ci.TmdbId, ci.MediaType }).IsUnique();

                entity.HasOne(ci => ci.List)
                    .WithMany(c => c.Items)
                    .HasForeignKey(ci => ci.ListId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // MovieEmbedding configuration (AI Discovery - Phase 10)
            builder.Entity<MovieEmbedding>(entity =>
            {
                entity.ToTable("movie_embeddings");
                entity.Property(e => e.TmdbId).HasColumnName("tmdb_id");
                entity.Property(e => e.MediaType).HasColumnName("media_type").HasMaxLength(10);
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(500);
                entity.Property(e => e.Overview).HasColumnName("overview");
                entity.Property(e => e.Genres).HasColumnName("genres");
                entity.Property(e => e.Keywords).HasColumnName("keywords");
                entity.Property(e => e.CastCrew).HasColumnName("cast_crew");
                entity.Property(e => e.ReleaseYear).HasColumnName("release_year");
                entity.Property(e => e.VoteAverage).HasColumnName("vote_average");
                entity.Property(e => e.ContentText).HasColumnName("content_text");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                // Unique constraint: one row per (tmdb_id, media_type) — per D-19
                entity.HasIndex(e => new { e.TmdbId, e.MediaType }).IsUnique();

                if (isNpgsql)
                {
                    entity.Property(e => e.Embedding).HasColumnName("embedding");

                    // HNSW index for cosine similarity — m=16, ef_construction=64 (per D-16)
                    entity.HasIndex(e => e.Embedding)
                        .HasMethod("hnsw")
                        .HasOperators("vector_cosine_ops")
                        .HasStorageParameter("m", 16)
                        .HasStorageParameter("ef_construction", 64);
                }
                else
                {
                    entity.Ignore(e => e.Embedding);
                }
            });

            // AiQueryLog configuration (AI Discovery - Phase 10)
            builder.Entity<AiQueryLog>(entity =>
            {
                entity.ToTable("ai_query_logs");
                entity.Property(e => e.UserId).HasColumnName("user_id").HasMaxLength(450);
                entity.Property(e => e.QueryText).HasColumnName("query_text");
                entity.Property(e => e.ResultTmdbIds).HasColumnName("result_tmdb_ids");
                entity.Property(e => e.ResponseTimeMs).HasColumnName("response_time_ms");
                entity.Property(e => e.PromptTokens).HasColumnName("prompt_tokens");
                entity.Property(e => e.CompletionTokens).HasColumnName("completion_tokens");
                entity.Property(e => e.ResponseText).HasColumnName("response_text");
                entity.Property(e => e.TransformedQuery).HasColumnName("transformed_query");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            });
        }
    }
}
