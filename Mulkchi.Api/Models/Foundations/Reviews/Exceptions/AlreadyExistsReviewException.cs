using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Reviews.Exceptions;

public class AlreadyExistsReviewException : Xeption
{
    public AlreadyExistsReviewException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
