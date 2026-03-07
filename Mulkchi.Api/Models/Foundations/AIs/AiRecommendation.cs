#nullable disable

namespace Mulkchi.Api.Models.Foundations.AIs;

public class AiRecommendation
{
    public Guid Id { get; set; }
    public AiRecommendationType Type { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Score { get; set; }
    public string Metadata { get; set; }
    public bool IsActedUpon { get; set; }
    public Guid UserId { get; set; }
    public Guid? PropertyId { get; set; }
    public DateTimeOffset CreatedDate { get; set; }
    public DateTimeOffset UpdatedDate { get; set; }
    public DateTimeOffset? DeletedDate { get; set; }
}
