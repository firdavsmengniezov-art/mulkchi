#nullable disable

using Mulkchi.Api.Models.Foundations.Users;

namespace Mulkchi.Api.Models.Foundations.Auth;

/// <summary>
/// Returned in the HTTP response body after login / register / refresh.
/// Does NOT contain tokens — those are delivered via httpOnly cookies.
/// The <see cref="AccessToken"/> field is included solely for in-memory
/// use by the SignalR client (accessTokenFactory); it must never be
/// written to persistent storage (localStorage / sessionStorage).
/// </summary>
public class AuthUserInfo
{
    public Guid UserId { get; set; }
    public string Email { get; set; }
    public UserRole Role { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }

    /// <summary>
    /// Short-lived JWT for SignalR WebSocket authentication.
    /// Store only in memory — never in localStorage or sessionStorage.
    /// </summary>
    public string AccessToken { get; set; }

    public AuthUserInfo() { }

    public AuthUserInfo(AuthResponse response)
    {
        UserId = response.UserId;
        Email = response.Email;
        Role = response.Role;
        ExpiresAt = response.ExpiresAt;
        AccessToken = response.Token;
    }
}
