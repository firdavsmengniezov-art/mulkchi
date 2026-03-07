using Xeptions;

namespace Mulkchi.Api.Models.Foundations.RentalContracts.Exceptions;

public class RentalContractDependencyException : Xeption
{
    public RentalContractDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
