using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SI.Project.IdentityServer.Services;
using System.Security.Claims;

namespace SI.Project.IdentityServer.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ClientOnlineHub : Hub
{
    private readonly ILogger _logger;

    public ClientOnlineHub(ILogger<ClientOnlineHub> logger)
    {
        _logger = logger;
    }

    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task SendHeartbeat([FromServices] IUsersOnlineStatusService onlineStatusService)
    {
        var context = Context;
        var user = context.User;
        var userId = user.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value;

        _logger.LogInformation("Heartbeat from user {0}", userId);

        onlineStatusService.SetOnlineStatus(
            new Models.UserOnlineStatus(
                userId,
                DateTime.UtcNow,
                true));
    }
}
