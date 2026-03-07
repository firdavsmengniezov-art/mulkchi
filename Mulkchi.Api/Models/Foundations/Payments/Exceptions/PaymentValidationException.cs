using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Payments.Exceptions;

public class PaymentValidationException : Xeption
{
    public PaymentValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
