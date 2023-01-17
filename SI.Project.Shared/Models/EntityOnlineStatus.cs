namespace SI.Project.Shared.Models;

public abstract class EntityOnlineStatus
{
    public string Id { get; set; }
    public DateTime LastHeartbeatTime { get; set; }
    public bool IsOnline { get; set; }

    protected EntityOnlineStatus(string id, DateTime lastHeartbeatTime, bool isOnline)
    {
        Id = id;
        LastHeartbeatTime = lastHeartbeatTime;
        IsOnline = isOnline;
    }
}
