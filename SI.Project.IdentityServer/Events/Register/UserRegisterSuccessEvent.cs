using Duende.IdentityServer.Events;

namespace SI.Project.IdentityServer.Events.Register;

public class UserRegisterSuccessEvent : Event
{
    public UserRegisterSuccessEvent(
        string email,
        string clientId)
        : base(
              EventCategories.Authentication,
              nameof(UserRegisterSuccessEvent),
              EventTypes.Success,
              EventIds.RegisterSuccess)
    {
        Email = email;
        ClientId = clientId;
    }

    public string Email { get; }
    public string ClientId { get; }
}
