using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Payments.Exceptions;

public class PaymentDependencyValidationException : Xeption
{
    public PaymentDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
