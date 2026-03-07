using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class FailedDiscountServiceException : Xeption
{
    public FailedDiscountServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
