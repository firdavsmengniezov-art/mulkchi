using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Reviews;
using Mulkchi.Api.Models.Foundations.Reviews.Exceptions;
using Mulkchi.Api.Brokers.DateTimes;
using Mulkchi.Api.Brokers.Loggings;
using Mulkchi.Api.Brokers.Storages;

namespace Mulkchi.Api.Services.Foundations.Reviews;

public partial class ReviewService : IReviewService
{
    private readonly IStorageBroker storageBroker;
    private readonly ILoggingBroker loggingBroker;
    private readonly IDateTimeBroker dateTimeBroker;

    public ReviewService(
        IStorageBroker storageBroker,
        ILoggingBroker loggingBroker,
        IDateTimeBroker dateTimeBroker)
    {
        this.storageBroker = storageBroker;
        this.loggingBroker = loggingBroker;
        this.dateTimeBroker = dateTimeBroker;
    }

    public ValueTask<Review> AddReviewAsync(Review review) =>
        TryCatch(async () =>
        {
            ValidateReviewOnAdd(review);
            Review addedReview = await this.storageBroker.InsertReviewAsync(review);
            await UpdatePropertyAverageRatingAsync(review.PropertyId);
            return addedReview;
        });

    public IQueryable<Review> RetrieveAllReviews() =>
        TryCatch(() => this.storageBroker.SelectAllReviews());

    public ValueTask<Review> RetrieveReviewByIdAsync(Guid reviewId) =>
        TryCatch(async () =>
        {
            ValidateReviewId(reviewId);
            Review maybeReview = await this.storageBroker.SelectReviewByIdAsync(reviewId);

            if (maybeReview is null)
                throw new NotFoundReviewException(reviewId);

            return maybeReview;
        });

    public ValueTask<Review> ModifyReviewAsync(Review review) =>
        TryCatch(async () =>
        {
            ValidateReviewOnModify(review);
            Review modifiedReview = await this.storageBroker.UpdateReviewAsync(review);
            await UpdatePropertyAverageRatingAsync(modifiedReview.PropertyId);
            return modifiedReview;
        });

    public ValueTask<Review> RemoveReviewByIdAsync(Guid reviewId) =>
        TryCatch(async () =>
        {
            ValidateReviewId(reviewId);
            Review deletedReview = await this.storageBroker.DeleteReviewByIdAsync(reviewId);
            await UpdatePropertyAverageRatingAsync(deletedReview.PropertyId);
            return deletedReview;
        });

    private async ValueTask UpdatePropertyAverageRatingAsync(Guid propertyId)
    {
        var reviews = this.storageBroker.SelectAllReviews()
            .Where(r => r.PropertyId == propertyId)
            .ToList();

        decimal averageRating = reviews.Count > 0
            ? reviews.Average(r => r.OverallRating)
            : 0m;

        Property maybeProperty = await this.storageBroker.SelectPropertyByIdAsync(propertyId);
        if (maybeProperty is not null)
        {
            maybeProperty.AverageRating = averageRating;
            maybeProperty.UpdatedDate = this.dateTimeBroker.GetCurrentDateTimeOffset();
            await this.storageBroker.UpdatePropertyAsync(maybeProperty);
        }
    }
}
