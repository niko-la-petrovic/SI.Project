using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SI.Project.IdentityServer.Dtos.UserDetails;
using SI.Project.IdentityServer.Services.UserDetails;

namespace SI.Project.IdentityServer.Controllers;

[Route("api/[controller]")]
public class UserDetailsController : UserAuthorizedController
{
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GetUserDetailsDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetUserDetailsDto>> GetUserDetailsDtoAsync(
        [FromServices] IUserDetailsService userDetailsService)
    {
        var dto = await userDetailsService.GetUserDetailsDtoAsync(UserId);
        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> UpdateUserDetailsDtoAsync(
        [FromServices] IUserDetailsService userDetailsService,
        [FromBody] PostUserDetailsDto dto)
    {
        await userDetailsService.CreateUserDetailsDtoAsync(UserId, dto);
        return Ok();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateUserDetailsDtoAsync(
        [FromServices] IUserDetailsService userDetailsService,
        [FromBody] PutUserDetailsDto dto)
    {
        await userDetailsService.UpdateUserDetailsDtoAsync(UserId, dto);
        return Ok();
    }
}
