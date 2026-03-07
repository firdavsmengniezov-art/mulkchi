using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class AuthServiceException : Xeption
{
    public AuthServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
