using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Messages.Exceptions;

public class MessageDependencyValidationException : Xeption
{
    public MessageDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
