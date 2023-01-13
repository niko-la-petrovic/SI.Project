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
