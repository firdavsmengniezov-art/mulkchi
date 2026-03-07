using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class InvalidLoginRequestException : Xeption
{
    public InvalidLoginRequestException(string message)
        : base(message)
    { }

    public InvalidLoginRequestException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
