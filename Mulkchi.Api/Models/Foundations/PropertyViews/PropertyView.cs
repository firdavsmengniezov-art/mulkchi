#nullable disable

namespace Mulkchi.Api.Models.Foundations.PropertyViews;

public class PropertyView
{
    public Guid Id { get; set; }
    public string IpAddress { get; set; }
    public string UserAgent { get; set; }
    public Guid PropertyId { get; set; }
    public Guid? UserId { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
