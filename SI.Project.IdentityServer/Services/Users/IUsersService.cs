using SI.Project.IdentityServer.Dtos.Users;

namespace SI.Project.IdentityServer.Services.Users
{
    public interface IUsersService
    {
        Task<IEnumerable<GetUserDto>> GetNewestOnlineUsersAsync();
    }
}