using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class AlreadyExistsDiscountUsageException : Xeption
{
    public AlreadyExistsDiscountUsageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
