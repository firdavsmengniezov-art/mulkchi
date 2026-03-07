using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Messages.Exceptions;

public class MessageValidationException : Xeption
{
    public MessageValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
