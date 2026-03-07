#nullable disable

namespace Mulkchi.Api.Models.Foundations.Announcements;

public class Announcement
{
    public Guid Id { get; set; }
    public string TitleUz { get; set; }
    public string TitleRu { get; set; }
    public string TitleEn { get; set; }
    public string ContentUz { get; set; }
    public string ContentRu { get; set; }
    public string ContentEn { get; set; }
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
