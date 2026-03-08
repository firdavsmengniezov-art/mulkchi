using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Reviews;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Reviews;

public partial class ReviewServiceTests
{
    [Fact]
    public async Task ShouldAddReviewAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        Review randomReview = CreateRandomReview();
        Review inputReview = randomReview;
        inputReview.CreatedDate = randomDateTimeOffset;
        inputReview.UpdatedDate = randomDateTimeOffset;
        Review expectedReview = inputReview;
        Property randomProperty = CreateRandomProperty(inputReview.PropertyId);

        IQueryable<Review> emptyReviews = new List<Review>().AsQueryable();
        IQueryable<Review> allReviewsAfterInsert = new List<Review> { inputReview }.AsQueryable();

        this.storageBrokerMock.SetupSequence(broker =>
            broker.SelectAllReviews())
                .Returns(emptyReviews)
                .Returns(allReviewsAfterInsert);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertReviewAsync(inputReview))
                .ReturnsAsync(expectedReview);

        this.storageBrokerMock.Setup(broker =>
            broker.SelectPropertyByIdAsync(inputReview.PropertyId))
                .ReturnsAsync(randomProperty);

        this.storageBrokerMock.Setup(broker =>
            broker.UpdatePropertyAsync(It.IsAny<Property>()))
                .ReturnsAsync(randomProperty);

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        // when
        Review actualReview = await this.reviewService.AddReviewAsync(inputReview);

        // then
        actualReview.Should().BeEquivalentTo(expectedReview);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Exactly(2));

        this.storageBrokerMock.Verify(broker =>
            broker.InsertReviewAsync(inputReview),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectAllReviews(),
            Times.Exactly(2));

        this.storageBrokerMock.Verify(broker =>
            broker.SelectPropertyByIdAsync(inputReview.PropertyId),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdatePropertyAsync(It.IsAny<Property>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
