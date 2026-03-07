using Xeptions;

namespace Mulkchi.Api.Models.Foundations.RentalContracts.Exceptions;

public class NullRentalContractException : Xeption
{
    public NullRentalContractException(string message)
        : base(message)
    { }
}
