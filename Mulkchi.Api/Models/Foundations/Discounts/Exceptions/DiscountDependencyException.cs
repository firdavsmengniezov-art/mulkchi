using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class DiscountDependencyException : Xeption
{
    public DiscountDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
