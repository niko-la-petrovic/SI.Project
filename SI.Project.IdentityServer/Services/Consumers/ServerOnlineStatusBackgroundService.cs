using EasyNetQ;
using EasyNetQ.Topology;
using SI.Project.IdentityServer.Models;
using SI.Project.Shared.Models.Messaging.ServerHealthCheck;

namespace SI.Project.IdentityServer.Services.Consumers;

public class ServerOnlineStatusBackgroundService : BackgroundService
{
    private readonly ILogger _logger;
    private readonly IBus _bus;
    private readonly IServerOnlineStatusService _serverOnlineService;

    public ServerOnlineStatusBackgroundService(
        ILogger<ServerOnlineStatusBackgroundService> logger,
        IBus bus,
        IServerOnlineStatusService serverOnlineService)
    {
        _logger = logger;
        _bus = bus;
        _serverOnlineService = serverOnlineService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogDebug("ServerOnlineStatusBackgroundService is running.");

        _bus.PubSub.Subscribe<ServerOnlineStatus>(string.Empty, sos =>
        {
            _logger.LogInformation("Received server healthcheck message from server {ServerId}", sos.Id);

            _serverOnlineService.SetOnlineStatus(sos);
        }, stoppingToken);
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogDebug($"{nameof(ServerOnlineStatusBackgroundService)} is running.");

            var removedStatuses = _serverOnlineService.RemoveOldStatuses(DateTime.UtcNow.AddSeconds(-OnlineStatusConstants.ServerMissingHeartBeatInactiveSeconds));
            if (removedStatuses.Any())
                _logger.LogInformation("Removed {OldStatuses} old statuses.", removedStatuses.Count());

            await Task.Delay(10000, stoppingToken);
        }
    }
}
