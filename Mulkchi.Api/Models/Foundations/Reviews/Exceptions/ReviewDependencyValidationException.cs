using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Reviews.Exceptions;

public class ReviewDependencyValidationException : Xeption
{
    public ReviewDependencyValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
