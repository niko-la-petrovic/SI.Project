using SI.Project.IdentityServer.Models;

namespace SI.Project.IdentityServer.Services;

public interface IEntityOnlineStatusService<TEntity>
    where TEntity : EntityOnlineStatus
{
    IEnumerable<TEntity> GetAllOnlineStatuses();
    IEnumerable<TEntity> GetLastOnlineUsers(TimeSpan timeSpan, int limit);
    TEntity? GetOnlineStatus(string id);
    IEnumerable<TEntity> GetOnlineStatuses(IEnumerable<string> ids, bool isOnline);
    IEnumerable<TEntity> RemoveOldStatuses(DateTime lastHeartbeatTime);
    void RemoveOnlineStatus(string id);
    void SetOnlineStatus(TEntity onlineStatus);
}