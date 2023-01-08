namespace SI.Project.IdentityServer.Models;

public class UserDetails
{
    public string UserId { get; set; }

    public string GivenName { get; set; }
    public string LastName { get; set; }
    public DateTime BirthDate { get; set; }
    

    public virtual ApplicationUser User { get; set; }
}
