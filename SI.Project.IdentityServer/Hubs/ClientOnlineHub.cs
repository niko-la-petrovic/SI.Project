using EasyNetQ;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SI.Project.IdentityServer.Dtos.Users;
using SI.Project.IdentityServer.Extensions;
using SI.Project.IdentityServer.Services;
using SI.Project.IdentityServer.Services.Servers;
using SI.Project.IdentityServer.Services.Users;
using SI.Project.Shared.Models.Messaging;
using System.Security.Claims;

namespace SI.Project.IdentityServer.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ClientOnlineHub : Hub
{
    private const string PrivateErrorMessage = nameof(PrivateErrorMessage);
    private const string PublicKeyRequest = nameof(PublicKeyRequest);
    private const string DirectReceiveMessagePart = nameof(DirectReceiveMessagePart);
    private readonly ILogger _logger;

    public ClientOnlineHub(ILogger<ClientOnlineHub> logger)
    {
        _logger = logger;
    }

    // TODO remove
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task SendHeartbeat([FromServices] IUsersOnlineStatusService onlineStatusService)
    {
        var userId = Context.UserIdentifier;

        _logger.LogInformation("Heartbeat from user {0}", userId);

        onlineStatusService.SetOnlineStatus(
            new Models.UserOnlineStatus(
                userId,
                DateTime.UtcNow,
                true));
    }

    public async Task SendMessageRequest(PostUserPublicKeyRequestDto requestDto, [FromServices] IUsersService usersService)
    {
        var userId = Context.UserIdentifier;
        var requestedUserId = requestDto.RequestedUserId;

        var requestorStatus = await usersService.GetOnlineUserAsync(userId);
        if (requestorStatus is null)
        {
            await Clients.User(userId).SendAsync(PrivateErrorMessage, $"You are offline.");
            return;
        }

        var requestedUser = await usersService.GetOnlineUserAsync(requestedUserId);
        if (requestedUser is null)
        {
            await Clients.User(userId).SendAsync(PrivateErrorMessage, $"Selected user is offline.");
            return;
        }

        var requestorPublicKey = await usersService.GetUserPublicKey(userId);
        if (requestorPublicKey is null)
        {
            await Clients.User(userId).SendAsync(PrivateErrorMessage, $"You don't have a public key configured.");
            return;
        }

        _logger.LogInformation("Sending public key request from user {0} to user {1}", userId, requestedUserId);
        await Clients.User(requestedUserId).SendAsync(PublicKeyRequest, new PostUserPublicKeyRequestMessageDto
        {
            Requestor = requestorStatus,
            UserId = requestedUserId,
            RequestorPublicKey = requestorPublicKey
        });
    }

    public async Task DenyPublicKeyRequest(PostUserPublicKeyRequestMessageDto requestMessageDto, [FromServices] IUsersService usersService)
    {
        var userId = Context.UserIdentifier;
        if (requestMessageDto.UserId != userId)
        {
            _logger.LogInformation("User {0} tried to deny public key request from user {1}", userId, requestMessageDto.UserId);

            await Clients.User(userId).SendAsync(PrivateErrorMessage,
                $"You are not allowed to deny public key request from user {requestMessageDto.UserId}.");
            return;
        }

        var denier = await usersService.GetOnlineUserAsync(userId);
        if (denier is null)
        {
            await Clients.User(userId).SendAsync(PrivateErrorMessage,
                $"You are offline.");
            return;
        }

        _logger.LogInformation("Denying public key request from user {0} to user {1}", requestMessageDto.Requestor.Id, userId);
        await Clients.User(requestMessageDto.Requestor.Id).SendAsync("PublicKeyRequestDenied", userId, denier.UserName);
    }

    public async Task AcceptPublicKeyRequest(PostUserPublicKeyRequestMessageDto requestMessageDto, [FromServices] IUsersService usersService)
    {
        var userId = Context.UserIdentifier;
        if (requestMessageDto.UserId != userId)
        {
            _logger.LogInformation("User {0} tried to accept public key request from user {1}", userId, requestMessageDto.UserId);
            await Clients.User(userId).SendAsync(PrivateErrorMessage,
                $"You are not allowed to accept public key request from user {requestMessageDto.UserId}.");
            return;
        }

        var accepter = await usersService.GetOnlineUserAsync(requestMessageDto.UserId);
        if (accepter is null)
        {
            await Clients.User(userId).SendAsync(PrivateErrorMessage, $"You are offline.");
            return;
        }

        var accepterPublicKey = await usersService.GetUserPublicKey(userId);

        _logger.LogInformation("Accepting public key request from user {0} to user {1}", requestMessageDto.Requestor.Id, userId);
        await Clients.User(requestMessageDto.Requestor.Id).SendAsync("PublicKeyRequestAccepted", userId, accepter.UserName, accepterPublicKey);
    }

    public async Task DirectSendMessagePart(
        MessagePart messagePart,
        [FromServices] IUsersService usersService,
        [FromServices] IBus bus,
        [FromServices] IServersService serversService)
    {
        var userId = Context.UserIdentifier;
        if (userId != messagePart.SenderId)
        {
            {
                _logger.LogInformation("User {0} tried to send message part as user {1}", userId, messagePart.SenderId);
                await Clients.User(userId).SendAsync(PrivateErrorMessage,
                    $"You are not allowed to send message parts on other users behalf ({messagePart.SenderId}).");
                return;
            }
        }

        var sender = await usersService.GetOnlineUserAsync(messagePart.SenderId);
        if (sender is null)
        {
            await Clients.User(userId).SendAsync(PrivateErrorMessage, $"You are offline.");
            return;
        }

        // TODO replace log param names with semantic names
        bus.PubSub.Publish(messagePart, config =>
        {
            var servers = serversService.GetOnlineServers();
            var serverCount = servers.Count();
            var serverIndex = messagePart.PartIndex % serverCount;
            var server = servers.ElementAt(serverIndex);
            var serverId = server.Id;

            _logger.LogInformation("Sending message part {MessagePartId} from user {UserId} to server {ServerId}", messagePart.PartIndex, messagePart.SenderId, serverId);
            config.WithTopic(serverId);
        });

        _logger.LogInformation("Sending message part from user {UserId} to user {1}", messagePart.SenderId, messagePart.ReceiverId);
        await Clients.User(messagePart.ReceiverId).SendAsync(DirectReceiveMessagePart, messagePart);
    }
}