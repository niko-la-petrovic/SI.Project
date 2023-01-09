using System.Security.Claims;

namespace SI.Project.IdentityServer.Extensions;

public static class ClaimsPrincipalExtensions
{
    private const string idClaimType = ClaimTypes.NameIdentifier;

    public static string GetId(this ClaimsPrincipal claimsPrincipal)
    {
        return claimsPrincipal.FindFirst(c => c.Type == idClaimType).Value;
    }
}
