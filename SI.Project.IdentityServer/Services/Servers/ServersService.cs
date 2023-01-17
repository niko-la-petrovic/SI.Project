using SI.Project.Shared.Models.Messaging.ServerHealthCheck;

namespace SI.Project.IdentityServer.Services.Servers;

public class ServersService : IServersService
{
    private readonly ILogger<ServersService> _logger;
    private readonly IServerOnlineStatusService _serverOnlineStatusService;
    public ServersService(
        ILogger<ServersService> logger,
        IServerOnlineStatusService serverOnlineStatusService)
    {
        _logger = logger;
        _serverOnlineStatusService = serverOnlineStatusService;
    }

    public IEnumerable<ServerOnlineStatus> GetOnlineServers()
    {
        var servers = _serverOnlineStatusService.GetOnlineEntities();
        return servers;
    }
}
