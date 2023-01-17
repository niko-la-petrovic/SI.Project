using SI.Project.IdentityServer.Models;
using SI.Project.Shared.Models.Messaging.ServerHealthCheck;

namespace SI.Project.IdentityServer.Services;

public interface IServerOnlineStatusService : IEntityOnlineStatusService<ServerOnlineStatus>
{
}