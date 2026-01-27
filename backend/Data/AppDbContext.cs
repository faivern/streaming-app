using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<MediaEntry> MediaEntries => Set<MediaEntry>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<List> Lists => Set<List>();
        public DbSet<ListItem> ListItems => Set<ListItem>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<AppUser>(entity =>
            {
                entity.Property(u => u.DisplayName).HasMaxLength(100);
                entity.Property(u => u.AvatarUrl).HasMaxLength(500);
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

                entity.Property(e => e.BackdropPath).HasMaxLength(500);
                entity.Property(e => e.Overview).HasMaxLength(2000);
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

                entity.Property(r => r.Content).HasMaxLength(10000);
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
                entity.Property(c => c.ThumbnailPath).HasMaxLength(500);
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
        }
    }
}
