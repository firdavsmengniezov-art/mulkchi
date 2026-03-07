using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class DiscountUsageDependencyException : Xeption
{
    public DiscountUsageDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
