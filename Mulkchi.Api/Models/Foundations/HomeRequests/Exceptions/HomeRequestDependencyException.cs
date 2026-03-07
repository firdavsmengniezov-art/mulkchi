using Xeptions;

namespace Mulkchi.Api.Models.Foundations.HomeRequests.Exceptions;

public class HomeRequestDependencyException : Xeption
{
    public HomeRequestDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
