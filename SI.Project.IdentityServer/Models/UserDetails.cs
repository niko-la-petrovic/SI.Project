using Microsoft.EntityFrameworkCore.Query.Internal;

namespace SI.Project.IdentityServer.Models;

public class UserDetails : DatedEntity
{
    public string UserId { get; set; }

    public string? GivenName { get; set; }
    public string? LastName { get; set; }
    public string? BirthDate { get; set; }
    public string PublicKey { get; set; }

    public virtual ApplicationUser User { get; set; }

    public UserDetails(
        string userId,
        string? givenName,
        string? lastName,
        string? birthDate,
        string publicKey)
    {
        UserId = userId;
        GivenName = givenName;
        LastName = lastName;
        BirthDate = birthDate;
        PublicKey = publicKey;
    }
}
