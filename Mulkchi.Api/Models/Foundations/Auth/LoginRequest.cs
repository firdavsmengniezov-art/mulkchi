#nullable disable

namespace Mulkchi.Api.Models.Foundations.Auth;

public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}
