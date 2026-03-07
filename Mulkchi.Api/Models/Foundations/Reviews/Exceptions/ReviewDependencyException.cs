using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Reviews.Exceptions;

public class ReviewDependencyException : Xeption
{
    public ReviewDependencyException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
