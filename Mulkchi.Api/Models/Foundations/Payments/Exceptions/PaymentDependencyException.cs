using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Payments.Exceptions;

public class PaymentDependencyException : Xeption
{
    public PaymentDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
