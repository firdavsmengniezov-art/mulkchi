using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Payments.Exceptions;

public class AlreadyExistsPaymentException : Xeption
{
    public AlreadyExistsPaymentException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
