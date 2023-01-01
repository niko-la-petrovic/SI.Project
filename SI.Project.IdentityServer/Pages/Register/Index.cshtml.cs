using Duende.IdentityServer.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace SI.Project.IdentityServer.Pages.Register;

public class IndexModel : PageModel
{
    [BindProperty]
    public RegisterViewModel RegisterModel { get; set; }

    public void OnGet()
    {
        if (User.IsAuthenticated())
        {
            // TODO redirect to sign out with return url to register
        }
    }

    public void OnPost()
    {
        if (User.IsAuthenticated())
        {
            // TODO handle
        }
    }
}
