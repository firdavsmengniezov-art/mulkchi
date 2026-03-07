using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class FailedAuthStorageException : Xeption
{
    public FailedAuthStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
