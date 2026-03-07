using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class InvalidRefreshTokenException : Xeption
{
    public InvalidRefreshTokenException(string message)
        : base(message)
    { }

    public InvalidRefreshTokenException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
