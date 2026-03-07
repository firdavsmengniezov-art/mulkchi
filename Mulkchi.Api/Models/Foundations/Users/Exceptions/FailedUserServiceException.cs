using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Users.Exceptions;

public class FailedUserServiceException : Xeption
{
    public FailedUserServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
