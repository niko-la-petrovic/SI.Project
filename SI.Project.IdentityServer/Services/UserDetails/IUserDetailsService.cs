using SI.Project.IdentityServer.Dtos.UserDetails;

namespace SI.Project.IdentityServer.Services.UserDetails;

public interface IUserDetailsService
{
    Task CreateUserDetailsDtoAsync(string userId, PostUserDetailsDto dto);
    Task<GetUserDetailsDto> GetUserDetailsDtoAsync(string userId);
    Task UpdateUserDetailsDtoAsync(string userId, PutUserDetailsDto dto);
}