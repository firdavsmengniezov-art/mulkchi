using Xeptions;

namespace Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;

public class HomeRequestDependencyValidationException : Xeption
{
    public HomeRequestDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
