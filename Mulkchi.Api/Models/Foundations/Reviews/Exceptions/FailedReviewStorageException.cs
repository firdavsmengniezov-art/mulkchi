using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Reviews.Exceptions;

public class FailedReviewStorageException : Xeption
{
    public FailedReviewStorageException(string message, Exception innerException)
        : base(message, innerException)
    { }
}
