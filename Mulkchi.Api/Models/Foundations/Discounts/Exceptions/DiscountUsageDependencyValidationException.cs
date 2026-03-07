using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class DiscountUsageDependencyValidationException : Xeption
{
    public DiscountUsageDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
