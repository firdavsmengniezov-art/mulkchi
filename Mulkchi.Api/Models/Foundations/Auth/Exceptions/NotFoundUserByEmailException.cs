using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class NotFoundUserByEmailException : Xeption
{
    public NotFoundUserByEmailException(string message)
        : base(message)
    { }
}
