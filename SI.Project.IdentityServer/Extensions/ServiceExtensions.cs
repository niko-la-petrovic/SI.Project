using SI.Project.IdentityServer.Services;
using SI.Project.IdentityServer.Services.Background;
using SI.Project.IdentityServer.Services.UserDetails;

namespace SI.Project.IdentityServer.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddBusinessServices(this IServiceCollection services)
    {
        services.AddSingleton<IUsersOnlineStatusService, UsersOnlineStatusService>();
        services.AddHostedService<UsersOnlineStatusBackgroundService>();

        services.AddScoped<IUserDetailsService, UserDetailsService>();

        return services;
    }
}
