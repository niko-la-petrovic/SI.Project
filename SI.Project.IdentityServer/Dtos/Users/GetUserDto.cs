namespace SI.Project.IdentityServer.Dtos.Users;

public class GetUserDto
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public bool IsOnline { get; set; }
    public DateTime LastHeartbeat { get; set; }
}
