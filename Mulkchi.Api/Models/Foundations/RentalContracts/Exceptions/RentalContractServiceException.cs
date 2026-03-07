using Xeptions;

namespace Mulkchi.Api.Models.Foundations.RentalContracts.Exceptions;

public class RentalContractServiceException : Xeption
{
    public RentalContractServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
