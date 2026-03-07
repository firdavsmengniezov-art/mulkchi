using Xeptions;

namespace Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;

public class HomeRequestServiceException : Xeption
{
    public HomeRequestServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
