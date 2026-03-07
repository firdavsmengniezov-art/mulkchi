using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Messages.Exceptions;

public class MessageDependencyException : Xeption
{
    public MessageDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
