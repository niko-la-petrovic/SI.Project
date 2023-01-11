using Microsoft.EntityFrameworkCore;
using SI.Project.IdentityServer.Data;
using SI.Project.IdentityServer.Dtos.Users;

namespace SI.Project.IdentityServer.Services.Users;

public class UsersService : IUsersService
{
    private readonly ApplicationDbContext _dbContext;

    public UsersService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<GetUserDto>> GetUsersAsync()
    {
        return await _dbContext.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedDate)
            .ThenByDescending(u => u.Id)
            .Select(u => new GetUserDto
            {
                Id = u.Id,
                UserName = u.UserName
            })
            
            .ToListAsync();
    }
}
