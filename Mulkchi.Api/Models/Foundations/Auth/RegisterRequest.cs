#nullable disable

namespace Mulkchi.Api.Models.Foundations.Auth;

public class RegisterRequest
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }  // optional
    public string Password { get; set; }
    public string PreferredLanguage { get; set; }
}
