#nullable disable

namespace Mulkchi.Api.Models.Foundations.Notifications;

public class Notification
{
    public Guid Id { get; set; }
    public string TitleUz { get; set; }
    public string TitleRu { get; set; }
    public string TitleEn { get; set; }
    public string BodyUz { get; set; }
    public string BodyRu { get; set; }
    public string BodyEn { get; set; }
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public DateTimeOffset? ReadAt { get; set; }
    public string ActionUrl { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
