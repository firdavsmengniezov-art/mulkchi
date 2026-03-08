using FluentAssertions;
using Moq;
using Mulkchi.Api.Models.Foundations.PropertyImages;

namespace Mulkchi.Api.Tests.Unit.Tests.Foundations.PropertyImages;

public partial class PropertyImageServiceTests
{
    [Fact]
    public async Task ShouldAddPropertyImageAsync()
    {
        // given
        DateTimeOffset randomDateTimeOffset = DateTimeOffset.UtcNow;
        PropertyImage randomPropertyImage = CreateRandomPropertyImage();
        PropertyImage inputPropertyImage = randomPropertyImage;
        inputPropertyImage.CreatedDate = randomDateTimeOffset;
        inputPropertyImage.UpdatedDate = randomDateTimeOffset;
        PropertyImage expectedPropertyImage = inputPropertyImage;

        this.dateTimeBrokerMock.Setup(broker =>
            broker.GetCurrentDateTimeOffset())
                .Returns(randomDateTimeOffset);

        this.storageBrokerMock.Setup(broker =>
            broker.InsertPropertyImageAsync(inputPropertyImage))
                .ReturnsAsync(expectedPropertyImage);

        // when
        PropertyImage actualPropertyImage = await this.propertyImageService.AddPropertyImageAsync(inputPropertyImage);

        // then
        actualPropertyImage.Should().BeEquivalentTo(expectedPropertyImage);

        this.dateTimeBrokerMock.Verify(broker =>
            broker.GetCurrentDateTimeOffset(),
            Times.Once);

        this.storageBrokerMock.Verify(broker =>
            broker.InsertPropertyImageAsync(inputPropertyImage),
            Times.Once);

        this.storageBrokerMock.VerifyNoOtherCalls();
    }
}
