using Microsoft.AspNetCore.Identity;

namespace SI.Project.IdentityServer.Models;

public class ApplicationUser : IdentityUser
{
    public virtual UserDetails Details { get; set; }
}
