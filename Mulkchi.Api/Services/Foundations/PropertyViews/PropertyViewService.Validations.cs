using Mulkchi.Api.Models.Foundations.PropertyViews;
using Mulkchi.Api.Models.Foundations.PropertyViews.Exceptions;
using Xeptions;

namespace Mulkchi.Api.Services.Foundations.PropertyViews;

public partial class PropertyViewService
{
    private void ValidatePropertyViewOnAdd(PropertyView propertyView)
    {
        ValidatePropertyViewIsNotNull(propertyView);
        Validate(
        (Rule: IsInvalid(propertyView.Id), Parameter: nameof(PropertyView.Id)),
        (Rule: IsInvalid(propertyView.PropertyId), Parameter: nameof(PropertyView.PropertyId)),
        (Rule: IsInvalid(propertyView.IpAddress), Parameter: nameof(PropertyView.IpAddress)));
    }

    private void ValidatePropertyViewOnModify(PropertyView propertyView)
    {
        ValidatePropertyViewIsNotNull(propertyView);
        Validate(
        (Rule: IsInvalid(propertyView.Id), Parameter: nameof(PropertyView.Id)),
        (Rule: IsInvalid(propertyView.PropertyId), Parameter: nameof(PropertyView.PropertyId)),
        (Rule: IsInvalid(propertyView.IpAddress), Parameter: nameof(PropertyView.IpAddress)));
    }

    private static void ValidatePropertyViewId(Guid propertyViewId)
    {
        if (propertyViewId == Guid.Empty)
        {
            throw new InvalidPropertyViewException(
                message: "PropertyView id is invalid.");
        }
    }

    private static void ValidatePropertyViewIsNotNull(PropertyView propertyView)
    {
        if (propertyView is null)
            throw new NullPropertyViewException(message: "PropertyView is null.");
    }

    private static dynamic IsInvalid(Guid id) => new
    {
        Condition = id == Guid.Empty,
        Message = "Id is required."
    };

    private static dynamic IsInvalid(string text) => new
    {
        Condition = string.IsNullOrWhiteSpace(text),
        Message = "Value is required."
    };

    private void Validate(params (dynamic Rule, string Parameter)[] validations)
    {
        var invalidPropertyViewException =
            new InvalidPropertyViewException(message: "PropertyView data is invalid.");

        foreach ((dynamic rule, string parameter) in validations)
        {
            if (rule.Condition)
                invalidPropertyViewException.UpsertDataList(parameter, rule.Message);
        }

        invalidPropertyViewException.ThrowIfContainsErrors();
    }
}
