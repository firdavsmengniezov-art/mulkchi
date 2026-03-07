using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Reviews.Exceptions;

public class ReviewServiceException : Xeption
{
    public ReviewServiceException(string message, Xeption innerException)
        : base(message, innerException)
    { }
}
