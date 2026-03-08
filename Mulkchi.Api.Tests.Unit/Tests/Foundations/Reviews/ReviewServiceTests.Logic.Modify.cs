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
