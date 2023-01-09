using Microsoft.AspNetCore.Identity;

namespace SI.Project.IdentityServer.Models;

public class ApplicationUser : IdentityUser
{
    public ApplicationUser(string userName, string email) : base(userName)
    {
        Id = Guid.NewGuid().ToString();
        Email = email;
    }

    public virtual UserDetails Details { get; set; }
}
