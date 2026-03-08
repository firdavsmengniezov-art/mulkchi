using Mulkchi.Api.Models.Foundations.RentalContracts;
using Mulkchi.Api.Models.Foundations.RentalContracts.Exceptions;
using Xeptions;

namespace Mulkchi.Api.Services.Foundations.RentalContracts;

public partial class RentalContractService
{
    private void ValidateRentalContractOnAdd(RentalContract rentalContract)
    {
        ValidateRentalContractIsNotNull(rentalContract);
        Validate(
        (Rule: IsInvalid(rentalContract.Id), Parameter: nameof(RentalContract.Id)),
        (Rule: IsInvalid(rentalContract.TenantId), Parameter: nameof(RentalContract.TenantId)),
        (Rule: IsInvalid(rentalContract.LandlordId), Parameter: nameof(RentalContract.LandlordId)),
        (Rule: IsInvalid(rentalContract.PropertyId), Parameter: nameof(RentalContract.PropertyId)),
        (Rule: IsInvalid(rentalContract.Terms), Parameter: nameof(RentalContract.Terms)),
        (Rule: IsInvalidOrNegative(rentalContract.MonthlyRent), Parameter: nameof(RentalContract.MonthlyRent)),
        (Rule: IsStartDateNotBeforeEndDate(rentalContract.StartDate, rentalContract.EndDate),
            Parameter: nameof(RentalContract.StartDate)));
    }

    private void ValidateRentalContractOnModify(RentalContract rentalContract)
    {
        ValidateRentalContractIsNotNull(rentalContract);
        Validate(
        (Rule: IsInvalid(rentalContract.Id), Parameter: nameof(RentalContract.Id)),
        (Rule: IsInvalid(rentalContract.TenantId), Parameter: nameof(RentalContract.TenantId)),
        (Rule: IsInvalid(rentalContract.LandlordId), Parameter: nameof(RentalContract.LandlordId)),
        (Rule: IsInvalid(rentalContract.PropertyId), Parameter: nameof(RentalContract.PropertyId)),
        (Rule: IsInvalid(rentalContract.Terms), Parameter: nameof(RentalContract.Terms)),
        (Rule: IsInvalidOrNegative(rentalContract.MonthlyRent), Parameter: nameof(RentalContract.MonthlyRent)),
        (Rule: IsStartDateNotBeforeEndDate(rentalContract.StartDate, rentalContract.EndDate),
            Parameter: nameof(RentalContract.StartDate)));
    }

    private static void ValidateRentalContractId(Guid rentalContractId)
    {
        if (rentalContractId == Guid.Empty)
        {
            throw new InvalidRentalContractException(
                message: "RentalContract id is invalid.");
        }
    }

    private static void ValidateRentalContractIsNotNull(RentalContract rentalContract)
    {
        if (rentalContract is null)
            throw new NullRentalContractException(message: "RentalContract is null.");
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

    private static dynamic IsInvalidOrNegative(decimal value) => new
    {
        Condition = value <= 0,
        Message = "Value must be greater than zero."
    };

    private static dynamic IsStartDateNotBeforeEndDate(DateTimeOffset startDate, DateTimeOffset endDate) => new
    {
        Condition = startDate >= endDate,
        Message = "Start date must be before end date."
    };

    private void Validate(params (dynamic Rule, string Parameter)[] validations)
    {
        var invalidRentalContractException =
            new InvalidRentalContractException(message: "RentalContract data is invalid.");

        foreach ((dynamic rule, string parameter) in validations)
        {
            if (rule.Condition)
                invalidRentalContractException.UpsertDataList(parameter, rule.Message);
        }

        invalidRentalContractException.ThrowIfContainsErrors();
    }
}
