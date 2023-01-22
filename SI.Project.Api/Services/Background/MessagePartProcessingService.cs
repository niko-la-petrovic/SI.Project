using EasyNetQ;
using SI.Project.Shared.Models.Messaging;

namespace SI.Project.Api.Services.Background;

public class MessagePartProcessingService : BackgroundService
{
    private readonly ILogger _logger;
    private readonly IBus _bus;

    public MessagePartProcessingService(
        ILogger<MessagePartProcessingService> logger,
        IBus bus
        )
    {
        _logger = logger;
        _bus = bus;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogDebug("MessagePartProcessingService is running.");

        var serverId = ServerHealthcheckSendService.ServerId;
        _bus.PubSub.Subscribe<MessagePart>(serverId, messagePart =>
        {
            _logger.LogInformation("Received message part {MessagePart}", messagePart);

            _bus.PubSub.PublishAsync(new ProcessedMessagePart
            {
                MessagePart = messagePart,
                ProcessedAt = DateTime.UtcNow,
                ServerId = serverId
            }, config =>
            {
            }, stoppingToken);

        }, config =>
        {
            config.WithDurable(false);
            config.WithAutoDelete(true);
            config.WithTopic(serverId);
        }, stoppingToken);



        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(10000, stoppingToken);
        }
    }
}
