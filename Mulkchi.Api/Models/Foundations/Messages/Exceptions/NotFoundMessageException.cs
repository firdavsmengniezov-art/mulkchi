using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Messages.Exceptions;

public class NotFoundMessageException : Xeption
{
    public NotFoundMessageException(Guid messageId)
        : base(message: $"Could not find message with id: {messageId}")
    { }
}
