#nullable disable

namespace Mulkchi.Api.Models.Foundations.Auth;

public class UserRefreshToken
{
    public Guid Id { get; set; }
    public string Token { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
}
