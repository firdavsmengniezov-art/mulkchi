#nullable disable

namespace Mulkchi.Api.Models.Foundations.Announcements;

public class Announcement
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Content { get; set; }
    public AnnouncementType Type { get; set; }
    public AnnouncementTarget Target { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
