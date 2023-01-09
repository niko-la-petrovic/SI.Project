using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SI.Project.IdentityServer.Models;

namespace SI.Project.IdentityServer.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<UserDetails> UserDetails { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(au =>
        {
            au.HasOne(au => au.Details)
            .WithOne(ud => ud.User)
            .HasForeignKey<UserDetails>(ud => ud.UserId)
            .HasPrincipalKey<ApplicationUser>(au => au.Id)
            .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<UserDetails>(ud =>
        {
            ud.HasKey(ud => ud.UserId);
        });
    }

    public override int SaveChanges()
    {
        AdjustEntities();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        AdjustEntities();

        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void AdjustEntities()
    {
        var entries = ChangeTracker
                      .Entries()
                      .Where(e => e.Entity is DatedEntity && (
                          e.State == EntityState.Added
                          || e.State == EntityState.Modified));

        var now = DateTime.UtcNow;

        foreach (var entityEntry in entries)
        {
            ((DatedEntity)entityEntry.Entity).UpdatedDate = now;

            if (entityEntry.State == EntityState.Added)
            {
                ((DatedEntity)entityEntry.Entity).CreatedDate = now;
            }
        }
    }
}
