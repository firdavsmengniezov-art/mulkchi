using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class AlreadyExistsDiscountException : Xeption
{
    public AlreadyExistsDiscountException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
