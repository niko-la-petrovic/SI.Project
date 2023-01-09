﻿using SI.Project.IdentityServer.Models;

namespace SI.Project.IdentityServer.Services;

public interface IEntityOnlineStatusService<TEntity>
    where TEntity : EntityOnlineStatus
{
    IEnumerable<TEntity> GetAllOnlineStatuses();
    TEntity GetOnlineStatus(string id);
    IEnumerable<TEntity> RemoveOldStatuses(DateTime lastHeartbeatTime);
    void RemoveOnlineStatus(string id);
    void SetOnlineStatus(TEntity onlineStatus);
}