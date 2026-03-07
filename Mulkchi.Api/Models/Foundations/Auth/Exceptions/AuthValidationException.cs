using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class AuthValidationException : Xeption
{
    public AuthValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
