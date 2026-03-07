using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Users.Exceptions;

public class AlreadyExistsUserException : Xeption
{
    public AlreadyExistsUserException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
