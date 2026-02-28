using DocMan.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace DocMan.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId);
            entity.HasIndex(e => e.NormalizedEmail).IsUnique();
        });

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.DocumentId);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.ProcessingStartedAtUtc).IsRequired(false);

            entity.HasIndex(e => new { e.OwnerUserId, e.UploadedAtUtc }).HasDatabaseName("IX_Documents_OwnerUserId_UploadedAtUtc");
            entity.HasIndex(e => new { e.OwnerUserId, e.Status, e.UploadedAtUtc }).HasDatabaseName("IX_Documents_OwnerUserId_Status_UploadedAtUtc");

            entity.HasOne(d => d.Owner)
                  .WithMany()
                  .HasForeignKey(d => d.OwnerUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}