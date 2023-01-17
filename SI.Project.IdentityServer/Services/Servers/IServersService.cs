using SI.Project.Shared.Models.Messaging.ServerHealthCheck;

namespace SI.Project.IdentityServer.Services.Servers
{
    public interface IServersService
    {
        IEnumerable<ServerOnlineStatus> GetOnlineServers();
    }
}