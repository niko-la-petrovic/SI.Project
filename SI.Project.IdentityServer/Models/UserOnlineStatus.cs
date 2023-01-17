using Microsoft.AspNetCore.SignalR;
using SI.Project.Shared.Models;

namespace SI.Project.IdentityServer.Models;

public class UserOnlineStatus : EntityOnlineStatus
{
    public UserOnlineStatus(
        string id,
        DateTime lastHeartbeatTime,
        bool isOnline) : base(id, lastHeartbeatTime, isOnline)
    {
    }
}
