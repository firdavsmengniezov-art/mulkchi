#nullable disable

namespace Mulkchi.Api.Models.Foundations.RentalContracts;

public class RentalContract
{
    public Guid Id { get; set; }
    public ContractStatus Status { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public decimal MonthlyRent { get; set; }
    public decimal SecurityDeposit { get; set; }
    public string Terms { get; set; }
    public string DocumentUrl { get; set; }
    public bool IsSigned { get; set; }
    public DateTimeOffset? SignedAt { get; set; }
    public Guid TenantId { get; set; }
    public Guid LandlordId { get; set; }
    public Guid PropertyId { get; set; }
    public Guid? HomeRequestId { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
