using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class AuthDependencyValidationException : Xeption
{
    public AuthDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
