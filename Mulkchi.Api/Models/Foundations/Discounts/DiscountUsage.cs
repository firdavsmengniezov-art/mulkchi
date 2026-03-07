namespace Mulkchi.Api.Models.Foundations.Discounts;

public class DiscountUsage
{
    public Guid Id { get; set; }
    public Guid DiscountId { get; set; }
    public Guid UserId { get; set; }
    public Guid? HomeRequestId { get; set; }
    public decimal AmountSaved { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
