using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Messages.Exceptions;

public class AlreadyExistsMessageException : Xeption
{
    public AlreadyExistsMessageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
