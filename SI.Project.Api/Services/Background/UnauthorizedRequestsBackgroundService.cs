namespace SI.Project.IdentityServer.Services.Background;

public class UnauthorizedRequestsBackgroundService : BackgroundService
{
    private readonly ILogger _logger;

    public UnauthorizedRequestsBackgroundService(ILogger<UnauthorizedRequestsBackgroundService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            _logger.LogInformation("UnauthorizedRequestsBackgroundService is working.");
            
            Thread.Sleep(1000);
        }
    }
}
