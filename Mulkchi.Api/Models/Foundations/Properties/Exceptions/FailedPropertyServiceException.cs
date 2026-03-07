using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Properties.Exceptions;

public class FailedPropertyServiceException : Xeption
{
    public FailedPropertyServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
