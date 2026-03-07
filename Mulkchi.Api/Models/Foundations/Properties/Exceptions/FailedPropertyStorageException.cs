using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Properties.Exceptions;

public class FailedPropertyStorageException : Xeption
{
    public FailedPropertyStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
