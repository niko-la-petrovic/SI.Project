using Duende.IdentityServer.Events;

namespace SI.Project.IdentityServer.Events.Register;

public class UserRegisterFailedEvent : Event
{
    public UserRegisterFailedEvent(
        string email,
        string clientId)
        : base(
              EventCategories.Authentication,
              nameof(UserRegisterFailedEvent),
              EventTypes.Failure,
              EventIds.RegisterFailure)
    {
        Email = email;
        ClientId = clientId;
    }

    public string Email { get; }
    public string ClientId { get; }
}
