using Xeptions;

namespace Mulkchi.Api.Models.Foundations.RentalContracts.Exceptions;

public class FailedRentalContractServiceException : Xeption
{
    public FailedRentalContractServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
