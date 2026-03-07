using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Messages.Exceptions;

public class InvalidMessageException : Xeption
{
    public InvalidMessageException(string message)
        : base(message)
    { }

    public InvalidMessageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
