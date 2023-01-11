namespace SI.Project.IdentityServer.Dtos.UserDetails;

public class PostUserDetailsDto
{
    public string? GivenName { get; set; }
    public string? LastName { get; set; }
    public string? BirthDate { get; set; }
    public string PublicKey { get; set; }
}
