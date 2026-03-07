using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Reviews.Exceptions;

public class ReviewValidationException : Xeption
{
    public ReviewValidationException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
