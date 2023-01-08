namespace SI.Project.IdentityServer.Services.Background;

public class UsersOnlineStatusBackgroundService : BackgroundService
{
    private readonly ILogger _logger;
    private readonly IUsersOnlineStatusService _usersOnlineStatusService;

    public UsersOnlineStatusBackgroundService(ILogger<UsersOnlineStatusBackgroundService> logger,
        IUsersOnlineStatusService usersOnlineStatusService)
    {
        _logger = logger;
        _usersOnlineStatusService = usersOnlineStatusService;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            //_logger.LogInformation("UsersOnlineStatusBackgroundService is running.");
            await Task.Delay(10000, stoppingToken);
        }
    }
}
