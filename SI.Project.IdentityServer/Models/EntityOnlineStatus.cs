namespace SI.Project.IdentityServer.Models;

public abstract class EntityOnlineStatus
{
    public string Id { get; set; }
    public DateTime LastHeartbeatTime { get; set; }
    public bool IsOnline { get; set; }
}
