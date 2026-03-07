using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class DiscountDependencyValidationException : Xeption
{
    public DiscountDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
