using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class FailedDiscountUsageStorageException : Xeption
{
    public FailedDiscountUsageStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
