using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class NullDiscountUsageException : Xeption
{
    public NullDiscountUsageException(string message)
        : base(message)
    { }
}
