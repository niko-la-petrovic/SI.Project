namespace SI.Project.IdentityServer.Dtos.Users;

public class PostUserPublicKeyResultDto
{
    public string UserId { get; set; }
    public GetUserDto Requestor { get; set; }
}
