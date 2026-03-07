using Xeptions;

namespace Mulkchi.Api.Models.Foundations.RentalContracts.Exceptions;

public class NotFoundRentalContractException : Xeption
{
    public NotFoundRentalContractException(Guid rentalContractId)
        : base(message: $"Could not find rental contract with id: {rentalContractId}")
    { }
}
