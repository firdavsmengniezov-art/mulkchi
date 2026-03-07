using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Payments.Exceptions;

public class NotFoundPaymentException : Xeption
{
    public NotFoundPaymentException(Guid paymentId)
        : base(message: $"Could not find payment with id: {paymentId}")
    { }
}
