#nullable disable

namespace Mulkchi.Api.Models.Foundations.Notifications;

public class Notification
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Body { get; set; }
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
    public string ActionUrl { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
