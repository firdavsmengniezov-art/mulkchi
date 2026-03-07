using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class DiscountValidationException : Xeption
{
    public DiscountValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
