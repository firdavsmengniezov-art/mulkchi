using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Payments.Exceptions;

public class PaymentServiceException : Xeption
{
    public PaymentServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
