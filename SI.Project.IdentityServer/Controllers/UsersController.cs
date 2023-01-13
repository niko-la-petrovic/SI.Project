using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SI.Project.IdentityServer.Dtos.Users;
using SI.Project.IdentityServer.Services.Users;

namespace SI.Project.IdentityServer.Controllers;

[Route("api/[controller]")]
public class UsersController : UserAuthorizedController
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<GetUserDto>))]
    public async Task<IActionResult> GetLastOnlineUsersAsync(
        [FromServices] IUsersService usersService)
    {
        var users = await usersService.GetNewestOnlineUsersAsync();
        return Ok(users);
    }

    [HttpGet("search")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<GetUserDto>))]
    public async Task<IActionResult> GetSearchByUsername(
        [FromQuery] string? usernameQuery, [FromServices] IUsersService usersService)
    {
        var result = await usersService.SearchOnlineUsersAsync(usernameQuery);
        return Ok(result);
    }
}
