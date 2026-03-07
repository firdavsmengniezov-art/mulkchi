using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class NullRegisterRequestException : Xeption
{
    public NullRegisterRequestException(string message)
        : base(message)
    { }
}
