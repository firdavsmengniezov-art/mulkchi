using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class FailedDiscountUsageServiceException : Xeption
{
    public FailedDiscountUsageServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
