using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : IdentityDbContext<MoviebucketUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<WatchlistItem> WatchlistItems => Set<WatchlistItem>();
        public DbSet<UserMediaEntry> UserMediaEntries => Set<UserMediaEntry>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<Collection> Collections => Set<Collection>();
        public DbSet<CollectionItem> CollectionItems => Set<CollectionItem>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<MoviebucketUser>(entity =>
            {
                entity.Property(u => u.DisplayName).HasMaxLength(100);
                entity.Property(u => u.AvatarUrl).HasMaxLength(500);
            });

            builder.Entity<WatchlistItem>(entity =>
            {
                // Prevent duplicate entries (same user + same media)
                entity.HasIndex(w => new { w.UserId, w.TmdbId, w.MediaType }).IsUnique();

                entity.HasOne(w => w.User)
                    .WithMany()
                    .HasForeignKey(w => w.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // UserMediaEntry configuration
            builder.Entity<UserMediaEntry>(entity =>
            {
                // Prevent duplicate entries (same user + same media)
                entity.HasIndex(e => new { e.UserId, e.TmdbId, e.MediaType }).IsUnique();

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Default value for Status
                entity.Property(e => e.Status)
                    .HasDefaultValue(WatchStatus.WantToWatch);
            });

            // Review configuration - 1:1 relationship with UserMediaEntry
            builder.Entity<Review>(entity =>
            {
                // Enforce 1:1 relationship via unique index
                entity.HasIndex(r => r.UserMediaEntryId).IsUnique();

                entity.HasOne(r => r.UserMediaEntry)
                    .WithOne(e => e.Review)
                    .HasForeignKey<Review>(r => r.UserMediaEntryId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(r => r.IsPublic).HasDefaultValue(true);
                entity.Property(r => r.ContainsSpoilers).HasDefaultValue(false);
            });

            // Collection configuration
            builder.Entity<Collection>(entity =>
            {
                entity.HasOne(c => c.User)
                    .WithMany()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(c => c.IsPublic).HasDefaultValue(false);
            });

            // CollectionItem configuration
            builder.Entity<CollectionItem>(entity =>
            {
                // Prevent duplicate items in same collection
                entity.HasIndex(ci => new { ci.CollectionId, ci.TmdbId, ci.MediaType }).IsUnique();

                entity.HasOne(ci => ci.Collection)
                    .WithMany(c => c.Items)
                    .HasForeignKey(ci => ci.CollectionId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.Property(ci => ci.Position).HasDefaultValue(0);
            });
        }
    }
}