using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Messages.Exceptions;

public class MessageServiceException : Xeption
{
    public MessageServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
