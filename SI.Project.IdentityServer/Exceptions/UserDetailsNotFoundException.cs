using System.Runtime.Serialization;

namespace SI.Project.IdentityServer.Exceptions;

public class UserDetailsNotFoundException : NotFoundException
{
    public UserDetailsNotFoundException()
    {
    }

    public UserDetailsNotFoundException(string message) : base(message)
    {
    }

    public UserDetailsNotFoundException(string message, Exception innerException) : base(message, innerException)
    {
    }

    protected UserDetailsNotFoundException(SerializationInfo info, StreamingContext context) : base(info, context)
    {
    }
}
