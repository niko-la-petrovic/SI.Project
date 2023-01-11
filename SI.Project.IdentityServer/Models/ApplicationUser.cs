using Microsoft.AspNetCore.Identity;

namespace SI.Project.IdentityServer.Models;

public class ApplicationUser : IdentityUser, IDatedEntity
{
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }

    public ApplicationUser(string userName, string email) : base(userName)
    {
        Id = Guid.NewGuid().ToString();
        Email = email;
    }

    public virtual UserDetails Details { get; set; }
}
