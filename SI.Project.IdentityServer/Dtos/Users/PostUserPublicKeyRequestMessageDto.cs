namespace SI.Project.IdentityServer.Dtos.Users;

public class PostUserPublicKeyRequestMessageDto
{
    public string UserId { get; set; }
    public GetUserDto Requestor { get; set; }
    public string RequestorPublicKey { get; set; }
}
