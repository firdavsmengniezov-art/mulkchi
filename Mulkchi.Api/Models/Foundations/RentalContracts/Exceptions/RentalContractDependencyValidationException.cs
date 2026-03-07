using Xeptions;

namespace Mulkchi.Api.Models.Foundations.RentalContracts.Exceptions;

public class RentalContractDependencyValidationException : Xeption
{
    public RentalContractDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
