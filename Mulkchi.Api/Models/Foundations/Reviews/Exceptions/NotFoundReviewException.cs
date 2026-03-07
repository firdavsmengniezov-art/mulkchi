using Xeptions;

namespace Mulkchi.Api.Models.Foundations.Reviews.Exceptions;

public class NotFoundReviewException : Xeption
{
    public NotFoundReviewException(Guid reviewId)
        : base(message: $"Could not find review with id: {reviewId}")
    { }
}
