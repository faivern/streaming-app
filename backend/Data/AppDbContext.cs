using backend.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : IdentityDbContext<MoviebucketUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<WatchlistItem> WatchlistItems => Set<WatchlistItem>();

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
        }
    }
}