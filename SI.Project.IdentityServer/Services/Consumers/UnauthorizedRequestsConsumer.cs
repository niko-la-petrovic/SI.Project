using EasyNetQ;
using EasyNetQ.Topology;
using SI.Project.IdentityServer.Models.Messages;

namespace SI.Project.IdentityServer.Services.Consumers;

public class UnauthorizedRequestsConsumer : BackgroundService
{
    private readonly ILogger _logger;
    private readonly IBus _bus;

    public UnauthorizedRequestsConsumer(ILogger<UnauthorizedRequestsConsumer> logger
        , IBus bus)
    {
        _logger = logger;
        _bus = bus;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("UnauthorizedRequestsConsumer is working.");

        //_bus.PubSub.Publish(new UnauthorizedRequestMessage { Text = "something" }, config =>
        //{
        //    config
        //},stoppingToken);

        //_bus.PubSub.SubscribeAsync<>()

        //await _bus.PubSub.SubscribeAsync<UnauthorizedRequestMessage>(string.Empty, message =>
        //{
        //    _logger.LogInformation("UnauthorizedRequestsConsumer received message: {0}", message.Text);
        //},
        //config =>
        //{
        //    config.WithExchangeType(ExchangeType.Direct);  
        //},
        //stoppingToken);
    }
}
