using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

public class NotFoundDiscountUsageException : Xeption
{
    public NotFoundDiscountUsageException(Guid discountUsageId)
        : base(message: $"Could not find discount usage with id: {discountUsageId}")
    { }
}
