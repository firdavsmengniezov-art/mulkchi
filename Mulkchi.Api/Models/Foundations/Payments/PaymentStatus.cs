namespace Mulkchi.Api.Models.Foundations.Payments;

public enum PaymentStatus
{
    Pending,
    Processing,
    Completed,
    Failed,
    Refunded,
    Cancelled
}
