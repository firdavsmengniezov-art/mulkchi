using Mulkchi.Api.Models.Foundations.HomeRequests;
using Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;
using Xeptions;

namespace Mulkchi.Api.Services.Foundations.HomeRequests;

public partial class HomeRequestService
{
    private void ValidateHomeRequestOnAdd(HomeRequest homeRequest)
    {
        ValidateHomeRequestIsNotNull(homeRequest);
        Validate(
        (Rule: IsInvalid(homeRequest.Id), Parameter: nameof(HomeRequest.Id)),
        (Rule: IsInvalid(homeRequest.GuestId), Parameter: nameof(HomeRequest.GuestId)),
        (Rule: IsInvalid(homeRequest.HostId), Parameter: nameof(HomeRequest.HostId)),
        (Rule: IsInvalid(homeRequest.PropertyId), Parameter: nameof(HomeRequest.PropertyId)),
        (Rule: IsInvalidOrZero(homeRequest.GuestCount), Parameter: nameof(HomeRequest.GuestCount)));
    }

    private void ValidateHomeRequestOnModify(HomeRequest homeRequest)
    {
        ValidateHomeRequestIsNotNull(homeRequest);
        Validate(
        (Rule: IsInvalid(homeRequest.Id), Parameter: nameof(HomeRequest.Id)),
        (Rule: IsInvalid(homeRequest.GuestId), Parameter: nameof(HomeRequest.GuestId)),
        (Rule: IsInvalid(homeRequest.HostId), Parameter: nameof(HomeRequest.HostId)),
        (Rule: IsInvalid(homeRequest.PropertyId), Parameter: nameof(HomeRequest.PropertyId)),
        (Rule: IsInvalidOrZero(homeRequest.GuestCount), Parameter: nameof(HomeRequest.GuestCount)));
    }

    private static void ValidateHomeRequestId(Guid homeRequestId)
    {
        if (homeRequestId == Guid.Empty)
        {
            throw new InvalidHomeRequestException(
                message: "HomeRequest id is invalid.");
        }
    }

    private static void ValidateHomeRequestIsNotNull(HomeRequest homeRequest)
    {
        if (homeRequest is null)
            throw new NullHomeRequestException(message: "HomeRequest is null.");
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

    private static dynamic IsInvalidOrZero(int value) => new
    {
        Condition = value <= 0,
        Message = "Value must be greater than zero."
    };

    private void Validate(params (dynamic Rule, string Parameter)[] validations)
    {
        var invalidHomeRequestException =
            new InvalidHomeRequestException(message: "HomeRequest data is invalid.");

        foreach ((dynamic rule, string parameter) in validations)
        {
            if (rule.Condition)
                invalidHomeRequestException.UpsertDataList(parameter, rule.Message);
        }

        invalidHomeRequestException.ThrowIfContainsErrors();
    }
}
