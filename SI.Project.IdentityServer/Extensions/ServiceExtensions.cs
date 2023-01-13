using SI.Project.IdentityServer.Services;
using SI.Project.IdentityServer.Services.Background;
using SI.Project.IdentityServer.Services.Consumers;
using SI.Project.IdentityServer.Services.UserDetails;
using SI.Project.IdentityServer.Services.Users;

namespace SI.Project.IdentityServer.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddBusinessServices(this IServiceCollection services)
    {
        services.AddSingleton<IUsersOnlineStatusService, UsersOnlineStatusService>();
        services.AddHostedService<UsersOnlineStatusBackgroundService>();
        services.AddHostedService<UnauthorizedRequestsConsumer>();

        services.AddScoped<IUserDetailsService, UserDetailsService>();
        services.AddScoped<IUsersService, UsersService>();

        return services;
    }
}
