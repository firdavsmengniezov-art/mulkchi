using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class NullDiscountException : Xeption
{
    public NullDiscountException(string message)
        : base(message)
    { }
}
