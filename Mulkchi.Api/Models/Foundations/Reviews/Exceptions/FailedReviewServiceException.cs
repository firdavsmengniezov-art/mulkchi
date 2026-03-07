using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Reviews.Exceptions;

public class FailedReviewServiceException : Xeption
{
    public FailedReviewServiceException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
