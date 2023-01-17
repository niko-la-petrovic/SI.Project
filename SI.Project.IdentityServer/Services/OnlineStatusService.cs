using SI.Project.IdentityServer.Models;
using SI.Project.Shared.Models;
using System.Collections.Concurrent;

namespace SI.Project.IdentityServer.Services;

public abstract class EntityOnlineStatusService<TEntity> : IEntityOnlineStatusService<TEntity>
    where TEntity : EntityOnlineStatus
{
    private readonly ConcurrentDictionary<string, TEntity> _onlineStatuses = new();

    public TEntity? GetOnlineStatus(string id)
    {
        return _onlineStatuses.TryGetValue(id, out var onlineStatus) ? onlineStatus : null;
    }

    public void SetOnlineStatus(TEntity onlineStatus)
    {
        _onlineStatuses.AddOrUpdate(onlineStatus.Id, onlineStatus, (key, value) => onlineStatus);
    }

    public void RemoveOnlineStatus(string id)
    {
        _onlineStatuses.TryRemove(id, out _);
    }

    public void RemoveAllOnlineStatuses()
    {
        _onlineStatuses.Clear();
    }

    public IEnumerable<TEntity> GetAllOnlineStatuses()
    {
        return _onlineStatuses.Values;
    }

    public IEnumerable<TEntity> GetLastOnlineEntities(TimeSpan timeSpan, int limit)
    {
        // TODO cache
        return _onlineStatuses.Values
            .Where(os => os.IsOnline && DateTime.UtcNow.Subtract(os.LastHeartbeatTime) < timeSpan)
            .OrderByDescending(os => os.LastHeartbeatTime)
            .Take(limit)
            .ToList();
    }

    public IEnumerable<TEntity> GetOnlineEntities()
    {
        // TODO cache
        return _onlineStatuses.Values
            .Where(os => os.IsOnline)
            .ToList();
    }

    public IEnumerable<TEntity> GetOnlineStatuses(IEnumerable<string> ids)
    {
        return _onlineStatuses.Where(x => ids.Contains(x.Key)).Select(x => x.Value);
    }

    public IEnumerable<TEntity> GetOnlineStatuses()
    {
        return _onlineStatuses.Values.Where(x => x.IsOnline);
    }

    public IEnumerable<TEntity> GetOfflineStatuses()
    {
        return _onlineStatuses.Values.Where(x => !x.IsOnline);
    }

    public IEnumerable<TEntity> GetOnlineStatuses(DateTime lastHeartbeatTime)
    {
        return _onlineStatuses.Values.Where(x => x.LastHeartbeatTime > lastHeartbeatTime);
    }

    public IEnumerable<TEntity> GetOfflineStatuses(DateTime lastHeartbeatTime)
    {
        return _onlineStatuses.Values.Where(x => x.LastHeartbeatTime <= lastHeartbeatTime);
    }



    public IEnumerable<TEntity> GetOnlineStatuses(DateTime lastHeartbeatTime, IEnumerable<string> ids)
    {
        return _onlineStatuses.Values.Where(x => x.LastHeartbeatTime > lastHeartbeatTime && ids.Contains(x.Id));
    }

    public IEnumerable<TEntity> GetOfflineStatuses(DateTime lastHeartbeatTime, IEnumerable<string> ids)
    {
        return _onlineStatuses.Values.Where(x => x.LastHeartbeatTime <= lastHeartbeatTime && ids.Contains(x.Id));
    }

    public IEnumerable<TEntity> GetOnlineStatuses(DateTime lastHeartbeatTime, IEnumerable<string> ids, bool isOnline)
    {
        return _onlineStatuses.Values.Where(x => x.LastHeartbeatTime > lastHeartbeatTime && ids.Contains(x.Id) && x.IsOnline == isOnline);
    }

    public IEnumerable<TEntity> GetOfflineStatuses(DateTime lastHeartbeatTime, IEnumerable<string> ids, bool isOnline)
    {
        return _onlineStatuses.Values.Where(x => x.LastHeartbeatTime <= lastHeartbeatTime && ids.Contains(x.Id) && x.IsOnline == isOnline);
    }

    public IEnumerable<TEntity> GetOnlineStatuses(DateTime lastHeartbeatTime, bool isOnline)
    {
        return _onlineStatuses.Values.Where(x => x.LastHeartbeatTime > lastHeartbeatTime && x.IsOnline == isOnline);
    }

    public IEnumerable<TEntity> GetOfflineStatuses(DateTime lastHeartbeatTime, bool isOnline)
    {
        return _onlineStatuses.Values.Where(x => x.LastHeartbeatTime <= lastHeartbeatTime && x.IsOnline == isOnline);
    }

    public IEnumerable<TEntity> GetOnlineStatuses(bool isOnline)
    {
        return _onlineStatuses.Values.Where(x => x.IsOnline == isOnline);
    }

    public IEnumerable<TEntity> GetOfflineStatuses(bool isOnline)
    {
        return _onlineStatuses.Values.Where(x => x.IsOnline == isOnline);
    }

    public IEnumerable<TEntity> GetOnlineStatuses(IEnumerable<string> ids, bool isOnline)
    {
        return _onlineStatuses.Values.Where(x => ids.Contains(x.Id) && x.IsOnline == isOnline);
    }

    public IEnumerable<TEntity> RemoveOldStatuses(DateTime lastHeartbeatTime)
    {
        var oldStatuses = _onlineStatuses.Values
            .Where(x => x.LastHeartbeatTime <= lastHeartbeatTime);
        foreach (var oldStatus in oldStatuses)
            _onlineStatuses.TryRemove(oldStatus.Id, out _);

        return oldStatuses;
    }
}
