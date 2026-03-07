using Xeptions;

namespace Mulkchi.Api.Models.Foundations.RentalContracts.Exceptions;

public class RentalContractValidationException : Xeption
{
    public RentalContractValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
