using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class DiscountServiceException : Xeption
{
    public DiscountServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
