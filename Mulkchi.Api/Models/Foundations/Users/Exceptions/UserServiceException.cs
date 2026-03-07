using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Users.Exceptions;

public class UserServiceException : Xeption
{
    public UserServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
