using Xeptions;

namespace Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;

public class FailedHomeRequestServiceException : Xeption
{
    public FailedHomeRequestServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
