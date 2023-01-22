using EasyNetQ;
using SI.Project.Shared.Models.Messaging.ServerHealthCheck;

namespace SI.Project.Api.Services;

public class ServerHealthcheckSendService : BackgroundService
{
    private readonly ILogger<ServerHealthcheckSendService> _logger;
    private readonly IBus _bus;
    private static readonly string _serverId = Guid.NewGuid().ToString();
    public ServerHealthcheckSendService(ILogger<ServerHealthcheckSendService> logger, IBus bus)
    {
        _logger = logger;
        _bus = bus;
    }

    public static string ServerId => _serverId;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogDebug("ServerHealthcheckSendService is running.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var message = new ServerOnlineStatus(_serverId, DateTime.UtcNow, true);
            _logger.LogInformation("Sending server healthcheck message {message}", message);
            try
            {
                await _bus.PubSub.PublishAsync(message, config =>
                {
                    config.WithExpires(TimeSpan.FromSeconds(30));
                }, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending server healthcheck message.");
                throw;
            }
            await Task.Delay(5000, stoppingToken);
        }
    }
}
