using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.Properties;
using Mulkchi.Api.Models.Foundations.Reviews;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.Reviews;

public partial class ReviewServiceTests
{
    [Fact]
    public async Task ShouldModifyReviewAsync()
    {
        // given
        Review randomReview = CreateRandomReview();
        Review inputReview = randomReview;
        Review expectedReview = inputReview;
        Property randomProperty = CreateRandomProperty(inputReview.PropertyId);

        IQueryable<Review> allReviews = new List<Review> { inputReview }.AsQueryable();

        // Set up CurrentUserService mock to return the review's reviewer ID
        this.currentUserServiceMock.Setup(x => x.GetCurrentUserId())
            .Returns(inputReview.ReviewerId);
        this.currentUserServiceMock.Setup(x => x.IsInRole("Admin"))
            .Returns(false);

        // Mock the SelectReviewByIdAsync call that the authorization check makes
        this.storageBrokerMock.Setup(broker =>
            broker.SelectReviewByIdAsync(inputReview.Id))
                .ReturnsAsync(randomReview);

        this.storageBrokerMock.Setup(broker =>
            broker.UpdateReviewAsync(inputReview))
                .ReturnsAsync(expectedReview);

        this.storageBrokerMock.Setup(broker =>
            broker.SelectAllReviews())
                .Returns(allReviews);

        this.storageBrokerMock.Setup(broker =>
            broker.SelectPropertyByIdAsync(inputReview.PropertyId))
                .ReturnsAsync(randomProperty);

        this.storageBrokerMock.Setup(broker =>
            broker.UpdatePropertyAsync(It.IsAny<Property>()))
                .ReturnsAsync(randomProperty);

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(DateTimeOffset.UtcNow);

        // when
        Review actualReview = await this.reviewService.ModifyReviewAsync(inputReview);

        // then
        actualReview.Should().BeEquivalentTo(expectedReview);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectReviewByIdAsync(inputReview.Id),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdateReviewAsync(inputReview),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectAllReviews(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.SelectPropertyByIdAsync(inputReview.PropertyId),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.UpdatePropertyAsync(It.IsAny<Property>()),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
