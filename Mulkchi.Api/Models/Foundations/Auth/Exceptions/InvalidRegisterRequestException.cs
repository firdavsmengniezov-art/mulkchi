using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class InvalidRegisterRequestException : Xeption
{
    public InvalidRegisterRequestException(string message)
        : base(message)
    { }

    public InvalidRegisterRequestException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
