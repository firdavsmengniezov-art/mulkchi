#nullable disable

namespace Mulkchi.Api.Models.Foundations.Reviews;

public class Review
{
    public Guid Id { get; set; }
    public decimal OverallRating { get; set; }
    public decimal CleanlinessRating { get; set; }
    public decimal LocationRating { get; set; }
    public decimal ValueRating { get; set; }
    public decimal CommunicationRating { get; set; }
    public decimal AccuracyRating { get; set; }
    public string Comment { get; set; }
    public bool IsVerifiedStay { get; set; }
    public string HostResponse { get; set; }
    public DateTimeOffset? HostRespondedAt { get; set; }
    public Guid ReviewerId { get; set; }
    public Guid PropertyId { get; set; }
    public Guid? HomeRequestId { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
