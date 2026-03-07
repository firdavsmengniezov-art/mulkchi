using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Auth.Exceptions;

public class FailedAuthServiceException : Xeption
{
    public FailedAuthServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
