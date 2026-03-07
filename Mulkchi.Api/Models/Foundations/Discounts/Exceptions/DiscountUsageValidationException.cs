using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class DiscountUsageValidationException : Xeption
{
    public DiscountUsageValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
