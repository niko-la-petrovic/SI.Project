using SI.Project.Shared.Models.Messaging.ServerHealthCheck;

namespace SI.Project.IdentityServer.Services;

public class ServerOnlineStatusService : EntityOnlineStatusService<ServerOnlineStatus>, IServerOnlineStatusService
{
}
