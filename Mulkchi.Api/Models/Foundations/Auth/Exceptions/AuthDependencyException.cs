using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class AuthDependencyException : Xeption
{
    public AuthDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
