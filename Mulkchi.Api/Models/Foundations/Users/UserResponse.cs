#nullable disable

namespace Mulkchi.Api.Models.Foundations.Users;

public class UserResponse
{
    public Guid Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string AvatarUrl { get; set; }
    public string Bio { get; set; }
    public string Address { get; set; }
    public DateTimeOffset? DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public bool IsVerified { get; set; }
    public UserRole Role { get; set; }
    public HostBadge Badge { get; set; }
    public decimal Rating { get; set; }
    public decimal ResponseRate { get; set; }
    public int ResponseTimeMinutes { get; set; }
    public int TotalListings { get; set; }
    public int TotalBookings { get; set; }
    public DateTimeOffset? HostSince { get; set; }
    public string PreferredLanguage { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
}
