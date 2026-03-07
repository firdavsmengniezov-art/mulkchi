using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class DiscountUsageServiceException : Xeption
{
    public DiscountUsageServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
