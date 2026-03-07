using Mulkchi.Api.Models.Foundations.Discounts;
using Mulkchi.Api.Models.Foundations.Discounts.Exceptions;

namespace Mulkchi.Api.Services.Foundations.DiscountUsages;

public partial class DiscountUsageService
{
    private void ValidateDiscountUsageOnAdd(DiscountUsage discountUsage)
    {
        ValidateDiscountUsageIsNotNull(discountUsage);
        Validate(
        (Rule: IsInvalid(discountUsage.Id), Parameter: nameof(DiscountUsage.Id)),
        (Rule: IsInvalid(discountUsage.DiscountId), Parameter: nameof(DiscountUsage.DiscountId)),
        (Rule: IsInvalid(discountUsage.UserId), Parameter: nameof(DiscountUsage.UserId)));
    }

    private void ValidateDiscountUsageOnModify(DiscountUsage discountUsage)
    {
        ValidateDiscountUsageIsNotNull(discountUsage);
        Validate(
        (Rule: IsInvalid(discountUsage.Id), Parameter: nameof(DiscountUsage.Id)),
        (Rule: IsInvalid(discountUsage.DiscountId), Parameter: nameof(DiscountUsage.DiscountId)),
        (Rule: IsInvalid(discountUsage.UserId), Parameter: nameof(DiscountUsage.UserId)));
    }

    private static void ValidateDiscountUsageId(Guid discountUsageId)
    {
        if (discountUsageId == Guid.Empty)
        {
            throw new InvalidDiscountUsageException(
                message: "Discount usage id is invalid.");
        }
    }

    private static void ValidateDiscountUsageIsNotNull(DiscountUsage discountUsage)
    {
        if (discountUsage is null)
            throw new NullDiscountUsageException(message: "Discount usage is null.");
    }

    private static dynamic IsInvalid(Guid id) => new
    {
        Condition = id == Guid.Empty,
        Message = "Id is required."
    };

    private void Validate(params (dynamic Rule, string Parameter)[] validations)
    {
        var invalidDiscountUsageException =
            new InvalidDiscountUsageException(message: "Discount usage data is invalid.");

        foreach ((dynamic rule, string parameter) in validations)
        {
            if (rule.Condition)
                invalidDiscountUsageException.UpsertDataList(parameter, rule.Message);
        }

        invalidDiscountUsageException.ThrowIfContainsErrors();
    }
}
