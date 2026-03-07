using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Users.Exceptions;

public class FailedUserStorageException : Xeption
{
    public FailedUserStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
