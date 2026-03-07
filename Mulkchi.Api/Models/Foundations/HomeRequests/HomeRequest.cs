#nullable disable

namespace Mulkchi.Api.Models.Foundations.HomeRequests;

public class HomeRequest
{
    public Guid Id { get; set; }
    public RequestType Type { get; set; }
    public RequestStatus Status { get; set; }
    public DateTimeOffset? CheckInDate { get; set; }
    public DateTimeOffset? CheckOutDate { get; set; }
    public int? TotalNights { get; set; }
    public int GuestCount { get; set; }
    public decimal TotalPrice { get; set; }
    public string Message { get; set; }
    public string RejectionReason { get; set; }
    public string CancellationReason { get; set; }
    public Guid GuestId { get; set; }
    public Guid HostId { get; set; }
    public Guid PropertyId { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
