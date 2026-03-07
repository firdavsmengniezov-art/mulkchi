using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class FailedDiscountStorageException : Xeption
{
    public FailedDiscountStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
