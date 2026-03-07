using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class InvalidDiscountUsageException : Xeption
{
    public InvalidDiscountUsageException(string message)
        : base(message)
    { }

    public InvalidDiscountUsageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
