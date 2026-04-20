#nullable disable

using Mulkchi.Api.Models.Foundations.Users;

namespace Mulkchi.Api.Models.Foundations.Auth;

/// <summary>
/// Request to switch between Guest and Host modes for Single Identity system.
/// </summary>
public class SwitchRoleRequest
{
    /// <summary>
    /// Target mode to switch to (Guest or Host).
    /// </summary>
    public UserRole TargetMode { get; set; }
}
