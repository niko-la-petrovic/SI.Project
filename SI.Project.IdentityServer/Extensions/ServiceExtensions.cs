using SI.Project.IdentityServer.Services;
using SI.Project.IdentityServer.Services.Background;

namespace SI.Project.IdentityServer.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddBusinessServices(this IServiceCollection services)
    {
        services.AddSingleton<IUsersOnlineStatusService, UsersOnlineStatusService>();
        services.AddHostedService<UsersOnlineStatusBackgroundService>();

        return services;
    }
}
