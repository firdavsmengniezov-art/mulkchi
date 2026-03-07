using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class AlreadyExistsUserEmailException : Xeption
{
    public AlreadyExistsUserEmailException(string message)
        : base(message)
    { }

    public AlreadyExistsUserEmailException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
