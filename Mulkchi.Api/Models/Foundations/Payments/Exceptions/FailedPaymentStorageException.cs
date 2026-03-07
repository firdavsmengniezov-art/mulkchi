using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Payments.Exceptions;

public class FailedPaymentStorageException : Xeption
{
    public FailedPaymentStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
