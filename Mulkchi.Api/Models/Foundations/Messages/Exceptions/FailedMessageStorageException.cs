using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Messages.Exceptions;

public class FailedMessageStorageException : Xeption
{
    public FailedMessageStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
