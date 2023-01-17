namespace SI.Project.IdentityServer.Models;

public static class OnlineStatusConstants
{
    public const int UserMissingHeartBeatInactiveSeconds = 30;
    public const int ServerMissingHeartBeatInactiveSeconds = 10;
    public const int LastOnlineUsersSeconds = 10;
}
