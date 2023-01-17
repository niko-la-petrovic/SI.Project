using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SI.Project.Shared.Models.Messaging.ServerHealthCheck;

public class ServerOnlineStatus : EntityOnlineStatus
{
    public ServerOnlineStatus(string id, DateTime lastHeartbeatTime, bool isOnline) : base(id, lastHeartbeatTime, isOnline)
    {
    }
}
