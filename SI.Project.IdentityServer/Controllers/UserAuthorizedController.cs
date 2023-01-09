using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SI.Project.IdentityServer.Extensions;

namespace SI.Project.IdentityServer.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
[ApiController]
public class UserAuthorizedController : ControllerBase
{
    public string UserId => User.GetId();
}
