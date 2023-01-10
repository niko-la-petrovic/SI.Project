using Microsoft.EntityFrameworkCore;
using SI.Project.IdentityServer.Data;
using SI.Project.IdentityServer.Dtos;
using SI.Project.IdentityServer.Exceptions;

namespace SI.Project.IdentityServer.Services.UserDetails;

public class UserDetailsService : IUserDetailsService
{
    private readonly ApplicationDbContext _dbContext;

    public UserDetailsService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task CreateUserDetailsDtoAsync(string userId, PostUserDetailsDto dto)
    {
        var userDetails = new Models.UserDetails(
            userId,
            dto.GivenName,
            dto.LastName,
            dto.BirthDate,
            dto.PublicKey);
        _dbContext.UserDetails.Add(userDetails);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<GetUserDetailsDto> GetUserDetailsDtoAsync(string userId)
    {
        var userDetails = await GetUserDetailsAsync(userId);

        return new GetUserDetailsDto
        {
            UserId = userDetails.UserId,
            BirthDate = userDetails.BirthDate,
            GivenName = userDetails.GivenName,
            LastName = userDetails.LastName,
            PublicKey = userDetails.PublicKey
        };
    }

    private async Task<Models.UserDetails> GetUserDetailsAsync(string userId)
    {
        var userDetails = await _dbContext.UserDetails.FirstOrDefaultAsync(ud => ud.UserId == userId);
        if (userDetails is null)
            throw new UserDetailsNotFoundException();
        return userDetails;
    }

    public async Task UpdateUserDetailsDtoAsync(string userId, PutUserDetailsDto dto)
    {
        var userDetails = await GetUserDetailsAsync(userId);

        userDetails.GivenName = dto.GivenName;
        userDetails.LastName = dto.LastName;
        userDetails.BirthDate = dto.BirthDate;
        userDetails.PublicKey = dto.PublicKey;

        await _dbContext.SaveChangesAsync();
    }
}
