using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Users.Exceptions;

public class UserValidationException : Xeption
{
    public UserValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
