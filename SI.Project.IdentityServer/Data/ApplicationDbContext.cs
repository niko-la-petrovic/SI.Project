using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SI.Project.IdentityServer.Models;

namespace SI.Project.IdentityServer.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
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
}
