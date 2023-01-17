using EasyNetQ;
using EasyNetQ.AutoSubscribe;
using SI.Project.Shared.Models.Messaging;

namespace SI.Project.IdentityServer.Models.Messages;

public class UnauthorizedRequestMessage
{
    public MessagePart MessagePart { get; set; }
}
