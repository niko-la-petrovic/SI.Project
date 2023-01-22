using EasyNetQ;
using Microsoft.AspNetCore.SignalR;
using Microsoft.CodeAnalysis.FlowAnalysis;
using SI.Project.IdentityServer.Hubs;
using SI.Project.Shared.Models.Messaging;

namespace SI.Project.IdentityServer.Services.Background;

public class ProcessedMessagePartBackgroundService : BackgroundService
{
    private readonly ILogger _logger;
    private readonly IBus _bus;
    private readonly IServiceProvider _serviceProvider;

    public ProcessedMessagePartBackgroundService(
        ILogger<ProcessedMessagePartBackgroundService> logger,
        IBus bus,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _bus = bus;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogDebug("ProcessedMessagePartBackgroundService is running.");

        _bus.PubSub.Subscribe<ProcessedMessagePart>(string.Empty, async pmp =>
        {
            _logger.LogInformation("Server {ServerId} received ProcessedMessagePart {MessageId} : {MessagePartIndex} / {MessagePartCount}. Was processed at {ProcessedAt}", pmp.ServerId, pmp.MessagePart.Id, pmp.MessagePart.PartIndex, pmp.MessagePart.PartsCount, pmp.ProcessedAt);

            using var scope = _serviceProvider.CreateScope();
            var hub = scope.ServiceProvider.GetRequiredService<IHubContext<ClientOnlineHub>>();

            var messagePart = pmp.MessagePart;
            var receiverId = messagePart.ReceiverId;
            _logger.LogInformation("Sending message part from user {UserId} to user {1}", messagePart.SenderId, messagePart.ReceiverId);
            await hub.Clients.User(messagePart.ReceiverId).SendAsync(ClientOnlineHub.DirectReceiveMessagePart, messagePart);
        }, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogDebug("ProcessedMessagePartBackgroundService is running.");

            await Task.Delay(10000, stoppingToken);
        }
    }
}
