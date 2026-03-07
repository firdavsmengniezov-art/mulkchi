using Xeptions;

namespace Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;

public class FailedHomeRequestStorageException : Xeption
{
    public FailedHomeRequestStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
