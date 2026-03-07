using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Messages.Exceptions;

public class NullMessageException : Xeption
{
    public NullMessageException(string message)
        : base(message)
    { }
}
