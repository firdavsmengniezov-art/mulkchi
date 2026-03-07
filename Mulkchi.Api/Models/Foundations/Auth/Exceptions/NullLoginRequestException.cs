using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class NullLoginRequestException : Xeption
{
    public NullLoginRequestException(string message)
        : base(message)
    { }
}
