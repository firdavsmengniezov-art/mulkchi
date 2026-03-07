using Xeptions;

namespace Mulkchi.Api.Models.Foundations.RentalContracts.Exceptions;

public class FailedRentalContractStorageException : Xeption
{
    public FailedRentalContractStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
