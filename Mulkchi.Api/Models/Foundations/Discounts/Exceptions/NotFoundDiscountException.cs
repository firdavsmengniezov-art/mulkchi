using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class NotFoundDiscountException : Xeption
{
    public NotFoundDiscountException(Guid discountId)
        : base(message: $"Could not find discount with id: {discountId}")
    { }
}
