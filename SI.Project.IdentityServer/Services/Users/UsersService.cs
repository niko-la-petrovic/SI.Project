using Microsoft.EntityFrameworkCore;
using SI.Project.IdentityServer.Data;
using SI.Project.IdentityServer.Dtos.Users;
using SI.Project.IdentityServer.Models;

namespace SI.Project.IdentityServer.Services.Users;

public class UsersService : IUsersService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IUsersOnlineStatusService _usersOnlineStatusService;

    public UsersService(
        ApplicationDbContext dbContext,
        IUsersOnlineStatusService usersOnlineStatusService)
    {
        _dbContext = dbContext;
        _usersOnlineStatusService = usersOnlineStatusService;
    }

    public async Task<IEnumerable<GetUserDto>> GetNewestOnlineUsersAsync()
    {
        var lastOnlineUsers = _usersOnlineStatusService
            .GetLastOnlineUsers(TimeSpan.FromSeconds(OnlineStatusConstants.LastOnlineUsersSeconds), 10)
            .ToList();

        var userIds = lastOnlineUsers.Select(x => x.Id);

        var users = await _dbContext.Users
            .AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync();

        var usersWithTime = users
            .Join(lastOnlineUsers,
                u => u.Id,
                ou => ou.Id,
                (u, ou) => new { u, ou })
            .Select(x => new GetUserDto
            {
                Id = x.u.Id,
                UserName = x.u.UserName,
                IsOnline = x.ou.IsOnline,
                LastHeartbeat = x.ou.LastHeartbeatTime
            })
            .ToList();

        return usersWithTime;
    }
}
