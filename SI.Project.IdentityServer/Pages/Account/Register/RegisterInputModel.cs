using System.ComponentModel.DataAnnotations;

namespace SI.Project.IdentityServer.Pages.Account.Register;

public class RegisterInputModel
{
    [Required]
    public string Username { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }
    [Required]
    [Compare(nameof(Password))]
    public string ConfirmPassword { get; set; }

    public string Button { get; set; }
    public string? ReturnUrl { get; set; }
}
