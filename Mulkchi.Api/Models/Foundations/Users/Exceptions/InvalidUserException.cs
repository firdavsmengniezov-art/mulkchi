using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Users.Exceptions;

public class InvalidUserException : Xeption
{
    public InvalidUserException(string message)
        : base(message)
    { }

    public InvalidUserException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
