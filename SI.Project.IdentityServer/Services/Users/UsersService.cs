using Microsoft.EntityFrameworkCore;
using SI.Project.IdentityServer.Data;
using SI.Project.IdentityServer.Dtos.Users;
using SI.Project.IdentityServer.Models;

namespace SI.Project.IdentityServer.Services.Users;

public class UsersService : IUsersService
{
    private const int UserPageLimit = 10;
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
            .GetLastOnlineEntities(TimeSpan.FromSeconds(OnlineStatusConstants.LastOnlineUsersSeconds), UserPageLimit)
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

    public async Task<IEnumerable<GetUserDto>> SearchOnlineUsersAsync(string? usernameQuery)
    {
        var users = await _dbContext.Users.AsNoTracking()
            .Where(u => EF.Functions.Like(u.NormalizedUserName, $"{usernameQuery.ToUpper()}%"))
            .Take(UserPageLimit)
            .ToListAsync();

        var userIds = users.Select(u => u.Id);

        var onlineStatuses = _usersOnlineStatusService.GetOnlineStatuses(userIds, true);

        var filteredUsers = onlineStatuses.Join(users, uos => uos.Id, user => user.Id, (uos, u) => new { UserOnlineStatus = uos, User = u })
            .OrderByDescending(g => g.User.UserName)
            .Take(UserPageLimit)
            .Select(g => new GetUserDto
            {
                Id = g.User.Id,
                IsOnline = g.UserOnlineStatus.IsOnline,
                UserName = g.User.UserName,
                LastHeartbeat = g.UserOnlineStatus.LastHeartbeatTime
            })
            .ToList();

        return filteredUsers;
    }

    public async Task<GetUserDto?> GetOnlineUserAsync(string userId)
    {
        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstAsync(u => u.Id == userId);

        // TODO exception handling
        var onlineStatus = _usersOnlineStatusService.GetOnlineStatus(userId);
        if (onlineStatus is null)
        {
            return null;
        }

        return new GetUserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            IsOnline = onlineStatus?.IsOnline ?? false,
            LastHeartbeat = onlineStatus?.LastHeartbeatTime ?? DateTime.MinValue
        };
    }

    public async Task<string?> GetUserPublicKey(string userId)
    {
        var userDetails = await _dbContext.UserDetails
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.UserId == userId);

        return userDetails?.PublicKey;
    }
}
