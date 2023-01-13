using EasyNetQ;

namespace SI.Project.IdentityServer.Models.Messages;

[Queue("unauthorized-requests")]
public class UnauthorizedRequestMessage
{
    public string Text { get; set; }
}
