using Mulkchi.Api.Models.Foundations.PropertyImages;
using Mulkchi.Api.Models.Foundations.PropertyImages.Exceptions;
using Xeptions;

namespace Mulkchi.Api.Services.Foundations.PropertyImages;

public partial class PropertyImageService
{
    private void ValidatePropertyImageOnAdd(PropertyImage propertyImage)
    {
        ValidatePropertyImageIsNotNull(propertyImage);
        Validate(
        (Rule: IsInvalid(propertyImage.Id), Parameter: nameof(PropertyImage.Id)),
        (Rule: IsInvalid(propertyImage.PropertyId), Parameter: nameof(PropertyImage.PropertyId)),
        (Rule: IsInvalid(propertyImage.Url), Parameter: nameof(PropertyImage.Url)));
    }

    private void ValidatePropertyImageOnModify(PropertyImage propertyImage)
    {
        ValidatePropertyImageIsNotNull(propertyImage);
        Validate(
        (Rule: IsInvalid(propertyImage.Id), Parameter: nameof(PropertyImage.Id)),
        (Rule: IsInvalid(propertyImage.PropertyId), Parameter: nameof(PropertyImage.PropertyId)),
        (Rule: IsInvalid(propertyImage.Url), Parameter: nameof(PropertyImage.Url)));
    }

    private static void ValidatePropertyImageId(Guid propertyImageId)
    {
        if (propertyImageId == Guid.Empty)
        {
            throw new InvalidPropertyImageException(
                message: "PropertyImage id is invalid.");
        }
    }

    private static void ValidatePropertyImageIsNotNull(PropertyImage propertyImage)
    {
        if (propertyImage is null)
            throw new NullPropertyImageException(message: "PropertyImage is null.");
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
        var invalidPropertyImageException =
            new InvalidPropertyImageException(message: "PropertyImage data is invalid.");

        foreach ((dynamic rule, string parameter) in validations)
        {
            if (rule.Condition)
                invalidPropertyImageException.UpsertDataList(parameter, rule.Message);
        }

        invalidPropertyImageException.ThrowIfContainsErrors();
    }
}
