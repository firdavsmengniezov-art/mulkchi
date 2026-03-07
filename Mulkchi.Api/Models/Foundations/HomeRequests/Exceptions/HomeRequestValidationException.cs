using Xeptions;

namespace Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;

public class HomeRequestValidationException : Xeption
{
    public HomeRequestValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
