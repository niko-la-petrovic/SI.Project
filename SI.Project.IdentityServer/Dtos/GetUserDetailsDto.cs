namespace SI.Project.IdentityServer.Dtos;

public class GetUserDetailsDto
{
    public string UserId { get; set; }

    public string? GivenName { get; set; }
    public string? LastName { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? PublicKey { get; set; }
}
