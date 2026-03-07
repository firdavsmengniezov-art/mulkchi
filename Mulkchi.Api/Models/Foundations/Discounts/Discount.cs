#nullable disable

namespace Mulkchi.Api.Models.Foundations.Discounts;

public class Discount
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string Description { get; set; }
    public DiscountType Type { get; set; }
    public DiscountTarget Target { get; set; }
    public decimal Value { get; set; }
    public decimal? MaxDiscountAmount { get; set; }
    public int? MaxUsageCount { get; set; }
    public int UsageCount { get; set; }
    public DateTimeOffset? StartsAt { get; set; }
    public DateTimeOffset? ExpiresAt { get; set; }
    public bool IsActive { get; set; }
    public Guid? PropertyId { get; set; }
    public Guid? UserId { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
