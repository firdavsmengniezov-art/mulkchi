using FluentAssertions;
using Microsoft.Data.SqlClient;
using Moq;
using Mulkchi.Api.Models.Foundations.Reviews;
using Mulkchi.Api.Models.Foundations.Reviews.Exceptions;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Reviews;

public partial class ReviewServiceTests
{
    [Fact]
    public async Task ShouldThrowDependencyException_OnAdd_WhenSqlExceptionOccurs()
    {
        // given
        Review someReview = CreateRandomReview();
        SqlException sqlException = CreateSqlException();

        IQueryable<Review> emptyReviews = new List<Review>().AsQueryable();

        this.storageBrokerMock.Setup(broker =>
            broker.SelectAllReviews())
                .Returns(emptyReviews);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertReviewAsync(It.IsAny<Review>()))
                .ThrowsAsync(sqlException);

        // when
        Func<Task> addReviewTask = async () =>
            await this.reviewService.AddReviewAsync(someReview);

        // then
        ReviewDependencyException actualException =
            await Assert.ThrowsAsync<ReviewDependencyException>(
                testCode: async () => await addReviewTask());

        actualException.InnerException.Should().BeOfType<FailedReviewStorageException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectAllReviews(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertReviewAsync(It.IsAny<Review>()),
            Times.Once);

        this.loggingBrokerMock.Verify(broker =>
            broker.LogError(It.IsAny<Exception>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
        this.loggingBrokerMock.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task ShouldThrowServiceException_OnAdd_WhenExceptionOccurs()
    {
        // given
        Review someReview = CreateRandomReview();
        var exception = new Exception();

        IQueryable<Review> emptyReviews = new List<Review>().AsQueryable();

        this.storageBrokerMock.Setup(broker =>
            broker.SelectAllReviews())
                .Returns(emptyReviews);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertReviewAsync(It.IsAny<Review>()))
                .ThrowsAsync(exception);

        // when
        Func<Task> addReviewTask = async () =>
            await this.reviewService.AddReviewAsync(someReview);

        // then
        ReviewServiceException actualException =
            await Assert.ThrowsAsync<ReviewServiceException>(
                testCode: async () => await addReviewTask());

        actualException.InnerException.Should().BeOfType<FailedReviewServiceException>();

        this.storageBrokerMock.Verify(broker =>
            broker.SelectAllReviews(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertReviewAsync(It.IsAny<Review>()),
            Times.Once);

        this.loggingBrokerMock.Verify(broker =>
            broker.LogError(It.IsAny<Exception>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
        this.loggingBrokerMock.VerifyNoOtherCalls();
    }
}
